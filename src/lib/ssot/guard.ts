import { supabase } from '../supabase/client';
import { getTableSchema } from './schema-registry';

/**
 * @pattern SSOT Guard Pattern
 * @description Wraps every database write to enforce Single-Source-of-Truth invariants.
 *              Prevents duplicate writes, ensures audit logging, and validates schemas.
 */

export interface WriteContext {
  workspace_id: string;
  source: 'voice' | 'webhook' | 'manual' | 'system';
  session_id?: string;
  idempotency_key: string;
}

export class SSOTViolationError extends Error {
  constructor(table: string, reason: string) {
    super(`SSOT violation on ${table}: ${reason}`);
    this.name = 'SSOTViolationError';
  }
}

/**
 * Guarded write operation that enforces:
 * 1. Zod schema validation
 * 2. Idempotency checks (prevent duplicates)
 * 3. Audit logging
 * 4. Tenant isolation (workspace_id)
 * 
 * @param table - Target database table
 * @param data - Data to insert (without workspace_id)
 * @param context - Security and tracing context
 * @returns The inserted record
 */
export async function guardedWrite<T extends Record<string, unknown>>(
  table: string,
  data: T,
  context: WriteContext
): Promise<T & { id: string; workspace_id: string }> {
  // 1. Validate schema against registry
  const schema = getTableSchema(table);
  if (!schema) {
    throw new SSOTViolationError(table, 'No Zod schema registered for this table');
  }
  
  const validated = schema.parse(data);

  // 2. Check idempotency (prevent duplicate writes)
  const { data: existing, error: fetchError } = await supabase
    .from('outbox')
    .select('id')
    .eq('idempotency_key', context.idempotency_key)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = not found
    throw new SSOTViolationError('outbox', `Idempotency check failed: ${fetchError.message}`);
  }

  if (existing) {
    console.warn(`[SSOT] Duplicate write blocked: ${context.idempotency_key}`);
    // Return existing result if available, or just throw to indicate no-op
    throw new SSOTViolationError(table, 'Idempotent write already processed');
  }

  // 3. Write to system of record (Supabase)
  const { data: result, error: insertError } = await supabase
    .from(table)
    .insert({ 
      ...validated, 
      workspace_id: context.workspace_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (insertError) {
    throw new SSOTViolationError(table, insertError.message);
  }

  // 4. Write audit log (same transaction via Supabase RPC would be ideal, 
  //    but doing sequentially here for clarity with JS client)
  await supabase.rpc('write_audit_log', {
    p_workspace_id: context.workspace_id,
    p_action: `${table}.created`,
    p_entity_type: table,
    p_entity_id: result.id,
    p_metadata: { 
      source: context.source, 
      session_id: context.session_id,
      idempotency_key: context.idempotency_key
    },
  });

  // 5. Queue vector index update if table has embeddings (async, non-blocking)
  if (hasEmbedding(table)) {
    await queueEmbeddingUpdate(table, result.id, context.workspace_id);
  }

  return result as T & { id: string; workspace_id: string };
}

/**
 * Check if a table requires vector embedding updates
 */
function hasEmbedding(table: string): boolean {
  const embeddingTables = ['merchant_entities', 'mesh_memories'];
  return embeddingTables.includes(table);
}

/**
 * Queue a background job to update vector embeddings
 */
async function queueEmbeddingUpdate(
  table: string, 
  recordId: string, 
  workspaceId: string
): Promise<void> {
  // Insert a job into pg-boss outbox or direct job table
  await supabase.from('workflow_nodes').insert({
    workspace_id: workspaceId,
    type: 'embedding_update',
    status: 'pending',
    payload: { table, record_id: recordId },
    scheduled_at: new Date().toISOString(),
  });
}
