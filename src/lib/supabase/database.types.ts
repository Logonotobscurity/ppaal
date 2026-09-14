/**
 * @module Database Types
 * @description TypeScript types generated from Supabase schema
 *              Run `npx supabase gen types typescript --project-id YOUR_PROJECT_ID` to regenerate
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          workspace_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          workspace_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          workspace_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      workspaces: {
        Row: {
          id: string;
          name: string;
          type: 'commerce' | 'personal' | 'health' | 'intel';
          owner_id: string;
          settings: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          type?: 'commerce' | 'personal' | 'health' | 'intel';
          owner_id: string;
          settings?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          type?: 'commerce' | 'personal' | 'health' | 'intel';
          owner_id?: string;
          settings?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      voice_sessions: {
        Row: {
          id: string;
          workspace_id: string;
          user_id: string;
          state: 'recording' | 'processing' | 'complete' | 'failed';
          audio_url: string | null;
          transcript: string | null;
          language_detected: string | null;
          codeswitch_detected: boolean | null;
          gs_score: number | null;
          gs_breakdown: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          user_id: string;
          state?: 'recording' | 'processing' | 'complete' | 'failed';
          audio_url?: string | null;
          transcript?: string | null;
          language_detected?: string | null;
          codeswitch_detected?: boolean | null;
          gs_score?: number | null;
          gs_breakdown?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          user_id?: string;
          state?: 'recording' | 'processing' | 'complete' | 'failed';
          audio_url?: string | null;
          transcript?: string | null;
          language_detected?: string | null;
          codeswitch_detected?: boolean | null;
          gs_score?: number | null;
          gs_breakdown?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      merchant_entities: {
        Row: {
          id: string;
          workspace_id: string;
          type: 'customer' | 'supplier' | 'item' | 'service';
          name: string;
          description: string | null;
          metadata: Json;
          embedding: number[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          type: 'customer' | 'supplier' | 'item' | 'service';
          name: string;
          description?: string | null;
          metadata?: Json;
          embedding?: number[] | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          type?: 'customer' | 'supplier' | 'item' | 'service';
          name?: string;
          description?: string | null;
          metadata?: Json;
          embedding?: number[] | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      mesh_memories: {
        Row: {
          id: string;
          workspace_id: string;
          content: string;
          summary: string | null;
          tags: string[];
          embedding: number[] | null;
          source_type: string;
          source_id: string | null;
          confidence: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          content: string;
          summary?: string | null;
          tags?: string[];
          embedding?: number[] | null;
          source_type: string;
          source_id?: string | null;
          confidence?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          content?: string;
          summary?: string | null;
          tags?: string[];
          embedding?: number[] | null;
          source_type?: string;
          source_id?: string | null;
          confidence?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      entity_links: {
        Row: {
          id: string;
          workspace_id: string;
          from_entity_id: string;
          to_entity_id: string;
          link_type: 'CONTAINS' | 'DEPENDS_ON' | 'OWES' | 'OWED_BY' | 'SUPPLIES' | 'PURCHASES_FROM' | 'RELATED_TO';
          strength: number | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          from_entity_id: string;
          to_entity_id: string;
          link_type: 'CONTAINS' | 'DEPENDS_ON' | 'OWES' | 'OWED_BY' | 'SUPPLIES' | 'PURCHASES_FROM' | 'RELATED_TO';
          strength?: number | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          from_entity_id?: string;
          to_entity_id?: string;
          link_type?: 'CONTAINS' | 'DEPENDS_ON' | 'OWES' | 'OWED_BY' | 'SUPPLIES' | 'PURCHASES_FROM' | 'RELATED_TO';
          strength?: number | null;
          metadata?: Json;
          created_at?: string;
        };
      };
      workflow_nodes: {
        Row: {
          id: string;
          workspace_id: string;
          session_id: string | null;
          action_type: 'send_message' | 'create_invoice' | 'schedule_payment' | 'update_record' | 'trigger_workflow' | 'escalate';
          status: 'pending' | 'staged' | 'approved' | 'rejected' | 'executing' | 'completed' | 'failed';
          payload: Json;
          gs_score: number | null;
          gs_breakdown: Json | null;
          scheduled_for: string | null;
          executed_at: string | null;
          result: Json | null;
          error_message: string | null;
          retry_count: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          session_id?: string | null;
          action_type: 'send_message' | 'create_invoice' | 'schedule_payment' | 'update_record' | 'trigger_workflow' | 'escalate';
          status?: 'pending' | 'staged' | 'approved' | 'rejected' | 'executing' | 'completed' | 'failed';
          payload?: Json;
          gs_score?: number | null;
          gs_breakdown?: Json | null;
          scheduled_for?: string | null;
          executed_at?: string | null;
          result?: Json | null;
          error_message?: string | null;
          retry_count?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          session_id?: string | null;
          action_type?: 'send_message' | 'create_invoice' | 'schedule_payment' | 'update_record' | 'trigger_workflow' | 'escalate';
          status?: 'pending' | 'staged' | 'approved' | 'rejected' | 'executing' | 'completed' | 'failed';
          payload?: Json;
          gs_score?: number | null;
          gs_breakdown?: Json | null;
          scheduled_for?: string | null;
          executed_at?: string | null;
          result?: Json | null;
          error_message?: string | null;
          retry_count?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      approval_queue: {
        Row: {
          id: string;
          workspace_id: string;
          workflow_node_id: string;
          requested_by: string;
          reason: string | null;
          risk_score: number;
          risk_breakdown: Json;
          status: 'pending' | 'approved' | 'rejected' | 'expired';
          decided_by: string | null;
          decision_reason: string | null;
          decided_at: string | null;
          expires_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          workflow_node_id: string;
          requested_by: string;
          reason?: string | null;
          risk_score: number;
          risk_breakdown: Json;
          status?: 'pending' | 'approved' | 'rejected' | 'expired';
          decided_by?: string | null;
          decision_reason?: string | null;
          decided_at?: string | null;
          expires_at: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          workflow_node_id?: string;
          requested_by?: string;
          reason?: string | null;
          risk_score?: number;
          risk_breakdown?: Json;
          status?: 'pending' | 'approved' | 'rejected' | 'expired';
          decided_by?: string | null;
          decision_reason?: string | null;
          decided_at?: string | null;
          expires_at?: string;
          created_at?: string;
        };
      };
      collections_ladder: {
        Row: {
          id: string;
          workspace_id: string;
          customer_entity_id: string;
          amount: number;
          currency: string;
          current_stage: 'initial_reminder' | 'follow_up_1' | 'follow_up_2' | 'final_notice' | 'escalated' | 'collected' | 'written_off';
          due_date: string;
          last_contacted_at: string | null;
          next_action_date: string | null;
          metadata: Json;
          resolved_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          customer_entity_id: string;
          amount: number;
          currency?: string;
          current_stage?: 'initial_reminder' | 'follow_up_1' | 'follow_up_2' | 'final_notice' | 'escalated' | 'collected' | 'written_off';
          due_date: string;
          last_contacted_at?: string | null;
          next_action_date?: string | null;
          metadata?: Json;
          resolved_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          customer_entity_id?: string;
          amount?: number;
          currency?: string;
          current_stage?: 'initial_reminder' | 'follow_up_1' | 'follow_up_2' | 'final_notice' | 'escalated' | 'collected' | 'written_off';
          due_date?: string;
          last_contacted_at?: string | null;
          next_action_date?: string | null;
          metadata?: Json;
          resolved_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {};
    Functions: {
      match_merchant_entities: {
        Args: {
          query_embedding: number[];
          match_threshold?: number;
          match_count?: number;
          ws_id?: string;
        };
        Returns: {
          id: string;
          workspace_id: string;
          type: 'customer' | 'supplier' | 'item' | 'service';
          name: string;
          description: string | null;
          similarity: number;
        }[];
      };
      match_mesh_memories: {
        Args: {
          query_embedding: number[];
          match_threshold?: number;
          match_count?: number;
          ws_id?: string;
        };
        Returns: {
          id: string;
          workspace_id: string;
          content: string;
          summary: string | null;
          tags: string[];
          source_type: string;
          source_id: string | null;
          confidence: number | null;
          similarity: number;
        }[];
      };
      is_quiet_hours: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      get_next_allowed_execution_time: {
        Args: { requested_time: string };
        Returns: string;
      };
      enforce_quiet_hours: {
        Args: { scheduled_time: string };
        Returns: string;
      };
    };
    Enums: {
      workspace_type: 'commerce' | 'personal' | 'health' | 'intel';
      voice_session_state: 'recording' | 'processing' | 'complete' | 'failed';
      entity_type: 'customer' | 'supplier' | 'item' | 'service';
      link_type: 'CONTAINS' | 'DEPENDS_ON' | 'OWES' | 'OWED_BY' | 'SUPPLIES' | 'PURCHASES_FROM' | 'RELATED_TO';
      workflow_node_status: 'pending' | 'staged' | 'approved' | 'rejected' | 'executing' | 'completed' | 'failed';
      workflow_action_type: 'send_message' | 'create_invoice' | 'schedule_payment' | 'update_record' | 'trigger_workflow' | 'escalate';
      approval_status: 'pending' | 'approved' | 'rejected' | 'expired';
      collection_stage: 'initial_reminder' | 'follow_up_1' | 'follow_up_2' | 'final_notice' | 'escalated' | 'collected' | 'written_off';
    };
  };
}
