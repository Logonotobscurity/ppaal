import { create } from 'zustand';

/**
 * @pattern Store Pattern (Zustand)
 * @description Global workspace state: extracted entities, active workflow,
 *              Gs breakdown, and selected mode (ASK / LEARN / DO).
 */

export type PalMode = 'ask' | 'learn' | 'do';

export interface WorkspaceEntity {
  id: string;
  type: 'customer' | 'amount' | 'date' | 'item' | 'commitment' | 'constraint';
  value: string | number;
  confidence: number;
}

export interface WorkflowNode {
  id: string;
  label: string;
  status: 'pending' | 'staged' | 'awaiting_approval' | 'executed' | 'blocked';
}

interface WorkspaceStore {
  // State
  mode: PalMode;
  entities: WorkspaceEntity[];
  workflow: WorkflowNode[];
  inspectorOpen: boolean;

  // Actions
  setMode: (mode: PalMode) => void;
  setEntities: (entities: WorkspaceEntity[]) => void;
  addWorkflowNode: (node: WorkflowNode) => void;
  updateNodeStatus: (id: string, status: WorkflowNode['status']) => void;
  setInspectorOpen: (open: boolean) => void;
  reset: () => void;
}

export const useWorkspaceStore = create<WorkspaceStore>()((set) => ({
  mode: 'ask',
  entities: [],
  workflow: [],
  inspectorOpen: false,

  setMode: (mode) => set({ mode }),

  setEntities: (entities) => set({ entities }),

  addWorkflowNode: (node) =>
    set((s) => ({ workflow: [...s.workflow, node] })),

  updateNodeStatus: (id, status) =>
    set((s) => ({
      workflow: s.workflow.map((n) => (n.id === id ? { ...n, status } : n)),
    })),

  setInspectorOpen: (inspectorOpen) => set({ inspectorOpen }),

  reset: () =>
    set({ mode: 'ask', entities: [], workflow: [], inspectorOpen: false }),
}));
