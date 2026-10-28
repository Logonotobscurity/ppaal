import { supabase } from '../supabase/client';

/**
 * @pattern Consistency Verification Pattern
 * @description Automated consistency checks run on every workflow execution.
 *              Detects and alerts on data integrity violations.
 */

export interface ConsistencyReport {
  runId: string;
  passed: boolean;
  failures: Array<{ check: string; error: string }>;
  timestamp: string;
}

interface CheckResult {
  passed: boolean;
  reason?: string;
}

type CheckFunction = (runId: string) => Promise<CheckResult>;

/**
 * Run all consistency checks for a given workflow run
 */
export async function verifyConsistency(runId: string): Promise<ConsistencyReport> {
  const checks: Array<{ name: string; fn: CheckFunction }> = [
    { name: 'checkEntityCount', fn: checkEntityCount },
    { name: 'checkFinancialBalance', fn: checkFinancialBalance },
    { name: 'checkConstraintsRespected', fn: checkConstraintsRespected },
    { name: 'checkGsBreakdownExists', fn: checkGsBreakdownExists },
    { name: 'checkAuditTrailComplete', fn: checkAuditTrailComplete },
    { name: 'checkNoOrphanedOutbox', fn: checkNoOrphanedOutbox },
  ];

  const results = await Promise.allSettled(checks.map(c => c.fn(runId)));
  
  const failures: Array<{ check: string; error: string }> = [];
  
  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      failures.push({
        check: checks[index].name,
        error: (result as PromiseRejectedResult).reason,
      });
    } else if (result.status === 'fulfilled' && !result.value.passed) {
      failures.push({
        check: checks[index].name,
        error: result.value.reason || 'Check failed',
      });
    }
  });

  if (failures.length > 0) {
    await alertService.notify({
      severity: 'high',
      message: `Consistency check failed for run ${runId}`,
      details: failures,
    });
  }

  return {
    runId,
    passed: failures.length === 0,
    failures,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Check 1: Entity count matches expected
 */
async function checkEntityCount(runId: string): Promise<{ passed: boolean; reason?: string }> {
  // Get expected entity count from workflow run
  const { data: run } = await supabase
    .from('workflow_runs')
    .select('expected_entity_count')
    .eq('id', runId)
    .single();

  if (!run) return { passed: true }; // No expectation set

  // Count actual entities
  const { count } = await supabase
    .from('merchant_entities')
    .select('*', { count: 'exact', head: true })
    .eq('source_session_id', runId);

  if (count !== run.expected_entity_count) {
    return { 
      passed: false, 
      reason: `Entity count mismatch: expected ${run.expected_entity_count}, got ${count}` 
    };
  }

  return { passed: true };
}

/**
 * Check 2: Financial totals balance
 */
async function checkFinancialBalance(runId: string): Promise<{ passed: boolean; reason?: string }> {
  // Sum all collection promises for this run
  const { data: promises } = await supabase
    .from('collection_promises')
    .select('amount')
    .eq('commitment_source', runId);

  if (!promises || promises.length === 0) return { passed: true };

  const total = promises.reduce((sum, p) => sum + (p.amount || 0), 0);

  // Compare against workflow payload if available
  const { data: run } = await supabase
    .from('workflow_runs')
    .select('payload')
    .eq('id', runId)
    .single();

  if (run?.payload?.expected_total && Math.abs(total - run.payload.expected_total) > 0.01) {
    return { 
      passed: false, 
      reason: `Financial imbalance: expected ${run.payload.expected_total}, got ${total}` 
    };
  }

  return { passed: true };
}

/**
 * Check 3: All constraints respected
 */
async function checkConstraintsRespected(runId: string): Promise<{ passed: boolean; reason?: string }> {
  // Get all constraints from the session
  const { data: constraints } = await supabase
    .from('merchant_entities')
    .select('value, type')
    .eq('type', 'constraint')
    .eq('source_session_id', runId);

  if (!constraints || constraints.length === 0) return { passed: true };

  // Verify no DO-mode actions violated constraints
  const { data: actions } = await supabase
    .from('workflow_nodes')
    .select('status, payload')
    .eq('source_session_id', runId)
    .eq('status', 'completed');

  if (!actions) return { passed: true };

  // Simple check: if any constraint is a negation, ensure no conflicting action
  const negations = constraints.filter(c => 
    typeof c.value === 'string' && 
    (c.value.toLowerCase().includes('no') || c.value.toLowerCase().includes('don\'t'))
  );

  if (negations.length > 0 && actions.length > 0) {
    return { 
      passed: false, 
      reason: `Actions executed despite ${negations.length} negation constraint(s)` 
    };
  }

  return { passed: true };
}

/**
 * Check 4: Gs breakdown persisted
 */
async function checkGsBreakdownExists(runId: string): Promise<{ passed: boolean; reason?: string }> {
  const { data: run } = await supabase
    .from('workflow_runs')
    .select('gs_breakdown')
    .eq('id', runId)
    .single();

  if (!run || !run.gs_breakdown) {
    return { passed: false, reason: 'Gs breakdown not persisted' };
  }

  return { passed: true };
}

/**
 * Check 5: Audit trail complete
 */
async function checkAuditTrailComplete(runId: string): Promise<{ passed: boolean; reason?: string }> {
  // Count audit log entries for this run
  const { count } = await supabase
    .from('audit_log')
    .select('*', { count: 'exact', head: true })
    .eq('session_id', runId);

  if (!count || count === 0) {
    return { passed: false, reason: 'No audit trail entries found' };
  }

  return { passed: true };
}

/**
 * Check 6: No orphaned outbox entries
 */
async function checkNoOrphanedOutbox(runId: string): Promise<{ passed: boolean; reason?: string }> {
  const { count } = await supabase
    .from('outbox')
    .select('*', { count: 'exact', head: true })
    .eq('source_run_id', runId)
    .eq('status', 'pending')
    .lt('created_at', new Date(Date.now() - 3600000).toISOString()); // Older than 1 hour

  if (count && count > 0) {
    return { 
      passed: false, 
      reason: `${count} orphaned outbox entries older than 1 hour` 
    };
  }

  return { passed: true };
}

/**
 * Alert service placeholder - wire up to your notification system
 */
const alertService = {
  notify: async (params: { severity: string; message: string; details: unknown[] }) => {
    console.error('[CONSISTENCY ALERT]', params.severity, params.message, params.details);
    // TODO: Integrate with Sentry, Slack, email, etc.
  },
};
