/**
 * Workspace Store (Zustand)
 * 
 * Manages global workspace state including:
 * - Current workspace selection
 * - User profiles
 * - Tenant isolation context
 */

import { create } from 'zustand';
import type { Profile, Workspace } from '../types/database';

interface WorkspaceState {
  // Current workspace
  currentWorkspace: Workspace | null;
  workspaces: Workspace[];
  
  // User profile
  profile: Profile | null;
  
  // Actions
  setCurrentWorkspace: (workspace: Workspace | null) => void;
  setWorkspaces: (workspaces: Workspace[]) => void;
  setProfile: (profile: Profile | null) => void;
  addWorkspace: (workspace: Workspace) => void;
  updateWorkspace: (id: string, updates: Partial<Workspace>) => void;
  removeWorkspace: (id: string) => void;
  
  // Computed
  isActiveWorkspace: (id: string) => boolean;
}

/**
 * Workspace store for managing tenant context
 * 
 * @example
 * ```typescript
 * const { currentWorkspace, setCurrentWorkspace } = useWorkspaceStore();
 * ```
 */
export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  currentWorkspace: null,
  workspaces: [],
  profile: null,

  setCurrentWorkspace: (workspace) => set({ currentWorkspace: workspace }),
  
  setWorkspaces: (workspaces) => set({ workspaces }),
  
  setProfile: (profile) => set({ profile }),
  
  addWorkspace: (workspace) => {
    const workspaces = [...get().workspaces, workspace];
    set({ workspaces });
  },
  
  updateWorkspace: (id, updates) => {
    const workspaces = get().workspaces.map((ws) =>
      ws.id === id ? { ...ws, ...updates } : ws
    );
    set({ workspaces });
    
    // Also update current if it's the one being updated
    const current = get().currentWorkspace;
    if (current && current.id === id) {
      set({ currentWorkspace: { ...current, ...updates } });
    }
  },
  
  removeWorkspace: (id) => {
    const workspaces = get().workspaces.filter((ws) => ws.id !== id);
    set({ workspaces });
    
    // Clear current if it's the one being removed
    const current = get().currentWorkspace;
    if (current && current.id === id) {
      set({ currentWorkspace: null });
    }
  },
  
  isActiveWorkspace: (id) => {
    const current = get().currentWorkspace;
    return current?.id === id;
  },
}));

/**
 * Selectors for common workspace operations
 */
export const workspaceSelectors = {
  selectCurrentWorkspaceId: (state: WorkspaceState) => state.currentWorkspace?.id,
  selectCurrentWorkspaceType: (state: WorkspaceState) => state.currentWorkspace?.type,
  selectWorkspaceCount: (state: WorkspaceState) => state.workspaces.length,
  selectHasActiveWorkspace: (state: WorkspaceState) => state.currentWorkspace !== null,
};
