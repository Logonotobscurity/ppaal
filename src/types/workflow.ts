import { z } from 'zod';

/**
 * @description Workflow node status enum
 */
export const WorkflowNodeStatusSchema = z.enum([
  'pending',
  'awaiting_approval',
  'approved',
  'rejected',
  'executing',
  'completed',
  'failed',
]);

export type WorkflowNodeStatus = z.infer<typeof WorkflowNodeStatusSchema>;

/**
 * @description Action types supported by the workflow executor
 */
export const ActionTypeSchema = z.enum([
  'send_payment',
  'send_message',
  'create_invoice',
  'schedule_reminder',
  'update_record',
]);

export type ActionType = z.infer<typeof ActionTypeSchema>;

/**
 * @description Workflow node schema - represents a single action in the execution queue
 */
export const WorkflowNodeSchema = z.object({
  id: z.string().uuid(),
  workspace_id: z.string().uuid(),
  action_type: ActionTypeSchema,
  description: z.string(),
  status: WorkflowNodeStatusSchema,
  payload: z.record(z.unknown()),
  gs_score: z.number().nullable(),
  gs_breakdown: z.record(z.number()).nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  executed_at: z.string().datetime().nullable(),
  approved_by: z.string().uuid().nullable(),
  rejected_by: z.string().uuid().nullable(),
  rejection_reason: z.string().nullable(),
  error_message: z.string().nullable(),
});

export type WorkflowNode = z.infer<typeof WorkflowNodeSchema>;

/**
 * @description Workflow schema - collection of nodes
 */
export const WorkflowSchema = z.object({
  id: z.string().uuid(),
  workspace_id: z.string().uuid(),
  name: z.string(),
  nodes: z.array(WorkflowNodeSchema),
  status: z.enum(['draft', 'active', 'paused', 'completed']),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type Workflow = z.infer<typeof WorkflowSchema>;
