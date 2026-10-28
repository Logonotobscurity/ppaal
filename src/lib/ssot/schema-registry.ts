import { z } from 'zod';
import { EntitySchema } from '../meaning-engine/entity-extractor';

/**
 * @pattern Schema Registry Pattern
 * @description Central registry of Zod schemas for all database tables.
 *              Used by SSOT Guard for runtime validation.
 */

// Re-export entity schema for use in guarded writes
export { EntitySchema };

/** Merchant Entities Schema */
export const MerchantEntitySchema = EntitySchema.extend({
  name: z.string().min(1),
  type: z.enum(['customer', 'supplier', 'item']),
  embedding: z.array(z.number()).length(768).optional(),
  metadata: z.record(z.unknown()).optional(),
});

/** Mesh Memory Schema */
export const MeshMemorySchema = z.object({
  workspace_id: z.string().uuid(),
  content: z.string(),
  embedding: z.array(z.number()).length(768),
  auto_tags: z.array(z.string()).optional(),
  citation_key: z.string(),
  source_session_id: z.string().uuid().optional(),
});

/** Workflow Node Schema */
export const WorkflowNodeSchema = z.object({
  workspace_id: z.string().uuid(),
  type: z.enum(['action', 'embedding_update', 'notification']),
  status: z.enum(['pending', 'running', 'completed', 'failed']),
  payload: z.record(z.unknown()),
  scheduled_at: z.string().datetime(),
  gs_score: z.number().min(0).max(10).optional(),
});

/** Collection Promise Schema */
export const CollectionPromiseSchema = z.object({
  workspace_id: z.string().uuid(),
  customer_id: z.string().uuid(),
  amount: z.number().positive(),
  currency: z.string().default('NGN'),
  due_date: z.string().datetime(),
  status: z.enum(['pending', 'promised', 'paid', 'overdue']),
  commitment_source: z.string().uuid(),
});

/** Schema Registry Map */
const schemaRegistry: Record<string, z.ZodSchema> = {
  merchant_entities: MerchantEntitySchema,
  mesh_memories: MeshMemorySchema,
  workflow_nodes: WorkflowNodeSchema,
  collection_promises: CollectionPromiseSchema,
  // Add more table schemas as needed
};

/**
 * Get Zod schema for a given table name
 * @param tableName - Database table name
 * @returns Zod schema or undefined if not registered
 */
export function getTableSchema(tableName: string): z.ZodSchema | undefined {
  return schemaRegistry[tableName];
}

/**
 * Register a new schema at runtime (for dynamic tables)
 * @param tableName - Database table name
 * @param schema - Zod schema
 */
export function registerSchema(tableName: string, schema: z.ZodSchema): void {
  schemaRegistry[tableName] = schema;
}
