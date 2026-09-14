/**
 * Approval Store (Zustand)
 * 
 * Manages approval queue state for DO mode actions
 * requiring human decision when Gs >= 3.0
 */

import { create } from 'zustand';
import type { ApprovalQueue, WorkflowNode } from '../types/database';

export type ApprovalDecision = 'approved' | 'rejected' | 'pending';

interface ApprovalState {
  // Queue state
  pendingApprovals: ApprovalQueue[];
  activeApproval: ApprovalQueue | null;
  
  // Workflow context
  associatedWorkflow: WorkflowNode | null;
  
  // Actions
  setPendingApprovals: (approvals: ApprovalQueue[]) => void;
  addPendingApproval: (approval: ApprovalQueue) => void;
  removePendingApproval: (id: string) => void;
  setActiveApproval: (approval: ApprovalQueue | null) => void;
  setAssociatedWorkflow: (workflow: WorkflowNode | null) => void;
  updateApprovalDecision: (id: string, decision: ApprovalDecision) => void;
  
  // Computed
  hasPendingApprovals: () => boolean;
  pendingCount: () => number;
}

/**
 * Approval store for managing gated DO mode actions
 * 
 * @example
 * ```typescript
 * const { pendingApprovals, updateApprovalDecision } = useApprovalStore();
 * ```
 */
export const useApprovalStore = create<ApprovalState>((set, get) => ({
  pendingApprovals: [],
  activeApproval: null,
  associatedWorkflow: null,

  setPendingApprovals: (approvals) => set({ pendingApprovals: approvals }),

  addPendingApproval: (approval) => {
    set((state) => ({
      pendingApprovals: [...state.pendingApprovals, approval],
    }));
  },

  removePendingApproval: (id) => {
    set((state) => ({
      pendingApprovals: state.pendingApprovals.filter((a) => a.id !== id),
    }));
  },

  setActiveApproval: (approval) => set({ activeApproval: approval }),

  setAssociatedWorkflow: (workflow) => set({ associatedWorkflow: workflow }),

  updateApprovalDecision: (id, decision) => {
    set((state) => ({
      pendingApprovals: state.pendingApprovals.map((a) =>
        a.id === id
          ? {
              ...a,
              decision,
              decided_at: decision !== 'pending' ? new Date().toISOString() : null,
            }
          : a
      ),
      // Also update active if it matches
      activeApproval:
        state.activeApproval?.id === id
          ? {
              ...state.activeApproval,
              decision,
              decided_at: decision !== 'pending' ? new Date().toISOString() : null,
            }
          : state.activeApproval,
    }));
  },

  hasPendingApprovals: () => {
    return get().pendingApprovals.length > 0;
  },

  pendingCount: () => {
    return get().pendingApprovals.length;
  },
}));

/**
 * Selectors for approval operations
 */
export const approvalSelectors = {
  selectPendingCount: (state: ApprovalState) => state.pendingApprovals.length,
  selectHasHighRisk: (state: ApprovalState) => {
    return state.pendingApprovals.some((a) => {
      const risk = a.risk_indicators as Record<string, unknown> | null;
      return risk?.['gs_score'] && (risk['gs_score'] as number) >= 5.0;
    });
  },
  selectOldestPending: (state: ApprovalState) => {
    if (state.pendingApprovals.length === 0) return null;
    return state.pendingApprovals.reduce((oldest, current) =>
      current.created_at < oldest.created_at ? current : oldest
    );
  },
};

/**
 * Risk level color mapping for UI
 */
export const RISK_COLORS: Record<number, string> = {
  0: 'bg-teal-500',    // 0-2.9: Low risk (auto-execute)
  1: 'bg-amber-500',   // 3.0-4.9: Medium risk (approval needed)
  2: 'bg-orange-500',  // 5.0-6.9: High risk (verbal confirm)
  3: 'bg-red-500',     // 7.0+: Blocked
};

/**
 * Get risk color based on Gs score
 */
export function getRiskColor(gsScore: number): string {
  if (gsScore < 3.0) return RISK_COLORS[0];
  if (gsScore < 5.0) return RISK_COLORS[1];
  if (gsScore < 7.0) return RISK_COLORS[2];
  return RISK_COLORS[3];
}
