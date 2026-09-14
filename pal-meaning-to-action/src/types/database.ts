/**
 * Supabase Database Types
 * 
 * Generated from Supabase schema.
 * All tables enforce tenant isolation via workspace_id.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

/**
 * User profile extending Supabase auth
 */
export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Workspace for tenant isolation
 * Types: 'commerce' | 'personal' | 'health' | 'intel'
 */
export interface Workspace {
  id: string;
  name: string;
  type: 'commerce' | 'personal' | 'health' | 'intel';
  owner_id: string;
  created_at: string;
  updated_at: string;
}

/**
 * Voice session metadata
 */
export interface VoiceSession {
  id: string;
  workspace_id: string;
  user_id: string;
  audio_url: string | null;
  transcript: string | null;
  language_detected: string | null;
  gs_score: number | null;
  gs_breakdown: Json | null;
  status: 'recording' | 'processing' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
}

/**
 * Merchant entity (customer, supplier, item)
 */
export interface MerchantEntity {
  id: string;
  workspace_id: string;
  type: 'customer' | 'supplier' | 'item';
  name: string;
  embedding: number[] | null; // 768-dim vector
  metadata: Json | null;
  created_at: string;
  updated_at: string;
}

/**
 * Semantic memory with auto-tagging
 */
export interface MeshMemory {
  id: string;
  workspace_id: string;
  content: string;
  embedding: number[] | null; // 768-dim vector
  tags: string[];
  source: 'voice' | 'text' | 'import';
  created_at: string;
  updated_at: string;
}

/**
 * Knowledge graph edge
 * Types: CONTAINS, DEPENDS_ON, OWES, SUPPLIES, LOCATED_IN, etc.
 */
export interface EntityLink {
  id: string;
  workspace_id: string;
  from_entity_id: string;
  to_entity_id: string;
  link_type: string;
  strength: number;
  created_at: string;
}

/**
 * Workflow action node
 */
export interface WorkflowNode {
  id: string;
  workspace_id: string;
  action_type: string;
  payload: Json;
  gs_score: number | null;
  status: 'pending' | 'approved' | 'rejected' | 'executing' | 'completed' | 'failed';
  scheduled_at: string | null;
  executed_at: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Human approval queue
 */
export interface ApprovalQueue {
  id: string;
  workspace_id: string;
  workflow_node_id: string;
  risk_indicators: Json | null;
  decision: 'approved' | 'rejected' | 'pending' | null;
  decided_by: string | null;
  decided_at: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Payment collection stage
 */
export interface CollectionLadder {
  id: string;
  workspace_id: string;
  entity_id: string;
  amount: number;
  currency: string;
  stage: 'reminder_sent' | 'follow_up' | 'escalated' | 'collected' | 'written_off';
  due_date: string;
  collected_at: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Database schema types for type-safe queries
 */
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>;
      };
      workspaces: {
        Row: Workspace;
        Insert: Omit<Workspace, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Workspace, 'id' | 'created_at'>>;
      };
      voice_sessions: {
        Row: VoiceSession;
        Insert: Omit<VoiceSession, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<VoiceSession, 'id' | 'created_at'>>;
      };
      merchant_entities: {
        Row: MerchantEntity;
        Insert: Omit<MerchantEntity, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<MerchantEntity, 'id' | 'created_at'>>;
      };
      mesh_memories: {
        Row: MeshMemory;
        Insert: Omit<MeshMemory, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<MeshMemory, 'id' | 'created_at'>>;
      };
      entity_links: {
        Row: EntityLink;
        Insert: Omit<EntityLink, 'created_at'>;
        Update: Partial<Omit<EntityLink, 'id' | 'created_at'>>;
      };
      workflow_nodes: {
        Row: WorkflowNode;
        Insert: Omit<WorkflowNode, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<WorkflowNode, 'id' | 'created_at'>>;
      };
      approval_queue: {
        Row: ApprovalQueue;
        Insert: Omit<ApprovalQueue, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<ApprovalQueue, 'id' | 'created_at'>>;
      };
      collections_ladder: {
        Row: CollectionLadder;
        Insert: Omit<CollectionLadder, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<CollectionLadder, 'id' | 'created_at'>>;
      };
    };
    Views: {};
    Functions: {};
  };
}
