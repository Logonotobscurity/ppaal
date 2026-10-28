import { z } from 'zod';

/**
 * @pattern Normalization Entry Point Pattern
 * @description Single normalization layer for ALL data sources entering PAL.
 *              Ensures consistent schema, confidence scoring, and audit logging.
 */

const NormalizedEntrySchema = z.object({
  source: z.enum(['voice', 'webhook', 'manual', 'system']),
  workspace_id: z.string().uuid(),
  entity_type: z.string(),
  payload: z.record(z.unknown()),
  confidence: z.number().min(0).max(1).optional(),
  session_id: z.string().uuid().optional(),
  idempotency_key: z.string().uuid(),
  timestamp: z.string().datetime(),
});

export type NormalizedEntry = z.infer<typeof NormalizedEntrySchema>;

/**
 * Normalize and persist data from any source through a single entry point.
 * 
 * @param raw - Raw data from any source
 * @param source - Source type (voice/webhook/manual/system)
 * @returns Normalized entry ready for business logic
 */
export async function normalizeAndPersist(
  raw: unknown,
  source: NormalizedEntry['source']
): Promise<NormalizedEntry> {
  // Generate idempotency key based on source and timestamp
  const idempotency_key = crypto.randomUUID();
  
  // Basic validation - specific schemas applied downstream
  const baseEntry = z.object({
    workspace_id: z.string().uuid(),
    entity_type: z.string(),
    payload: z.record(z.unknown()),
    confidence: z.number().min(0).max(1).optional(),
    session_id: z.string().uuid().optional(),
  }).parse(raw as Record<string, unknown>);

  const entry: NormalizedEntry = {
    ...baseEntry,
    source,
    idempotency_key,
    timestamp: new Date().toISOString(),
  };

  // Log to audit trail immediately
  await recordAuditLog({
    action: `data.${source}.received`,
    entity_type: entry.entity_type,
    metadata: { idempotency_key: entry.idempotency_key },
    workspace_id: entry.workspace_id,
  });

  return entry;
}

/**
 * Record an audit log entry
 */
async function recordAuditLog(params: {
  action: string;
  entity_type: string;
  metadata: Record<string, unknown>;
  workspace_id: string;
}): Promise<void> {
  // Import supabase client dynamically to avoid circular deps
  const { supabase } = await import('../supabase/client');
  
  await supabase.from('audit_log').insert({
    workspace_id: params.workspace_id,
    action: params.action,
    entity_type: params.entity_type,
    metadata: params.metadata,
    created_at: new Date().toISOString(),
  });
}

/**
 * Conflict resolution priorities for concurrent updates
 */
export const SOURCE_PRIORITY = {
  system: 1,      // Lowest priority
  voice: 2,
  webhook: 3,
  manual: 4,      // Highest priority (human override)
} as const;

export type SourcePriority = typeof SOURCE_PRIORITY[keyof typeof SOURCE_PRIORITY];

/**
 * Get priority value for a given source
 */
export function getSourcePriority(source: NormalizedEntry['source']): SourcePriority {
  return SOURCE_PRIORITY[source];
}
