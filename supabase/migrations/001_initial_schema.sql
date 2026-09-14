-- ============================================================
-- PAL: Meaning-to-Action Intelligence
-- Migration 001: Initial Schema
-- Description: Core tables for tenant isolation, entities, and workflows
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ============================================================
-- PROFILES (extends Supabase auth)
-- ============================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  workspace_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- WORKSPACES (tenant isolation boundary)
-- ============================================================
CREATE TYPE workspace_type AS ENUM ('commerce', 'personal', 'health', 'intel');

CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type workspace_type NOT NULL DEFAULT 'commerce',
  owner_id UUID NOT NULL REFERENCES profiles(id),
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add workspace_id to profiles
ALTER TABLE profiles ADD CONSTRAINT fk_profiles_workspace
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE SET NULL;

-- ============================================================
-- VOICE SESSIONS (raw audio + transcripts)
-- ============================================================
CREATE TYPE voice_session_state AS ENUM ('recording', 'processing', 'complete', 'failed');

CREATE TABLE voice_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES profiles(id),
  state voice_session_state NOT NULL DEFAULT 'recording',
  audio_url TEXT,
  transcript TEXT,
  language_detected TEXT,
  codeswitch_detected BOOLEAN DEFAULT FALSE,
  gs_score NUMERIC(3,2),
  gs_breakdown JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Composite tenant key
  CONSTRAINT unique_workspace_session UNIQUE (workspace_id, id)
);

-- ============================================================
-- MERCHANT ENTITIES (customers, suppliers, items)
-- ============================================================
CREATE TYPE entity_type AS ENUM ('customer', 'supplier', 'item', 'service');

CREATE TABLE merchant_entities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL,
  type entity_type NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  embedding vector(768),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Composite tenant key
  CONSTRAINT unique_workspace_entity UNIQUE (workspace_id, id)
);

-- ============================================================
-- MESH MEMORIES (semantic memory with auto-tagging)
-- ============================================================
CREATE TABLE mesh_memories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL,
  content TEXT NOT NULL,
  summary TEXT,
  tags TEXT[] DEFAULT '{}',
  embedding vector(768),
  source_type TEXT NOT NULL, -- 'voice', 'text', 'workflow'
  source_id UUID,
  confidence NUMERIC(3,2) DEFAULT 1.0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Composite tenant key
  CONSTRAINT unique_workspace_memory UNIQUE (workspace_id, id)
);

-- ============================================================
-- ENTITY LINKS (knowledge graph edges)
-- ============================================================
CREATE TYPE link_type AS ENUM (
  'CONTAINS', 'DEPENDS_ON', 'OWES', 'OWED_BY',
  'SUPPLIES', 'PURCHASES_FROM', 'RELATED_TO'
);

CREATE TABLE entity_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL,
  from_entity_id UUID NOT NULL REFERENCES merchant_entities(id),
  to_entity_id UUID NOT NULL REFERENCES merchant_entities(id),
  link_type link_type NOT NULL,
  strength NUMERIC(3,2) DEFAULT 1.0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Composite tenant key
  CONSTRAINT unique_workspace_link UNIQUE (workspace_id, id)
);

-- ============================================================
-- WORKFLOW NODES (action execution queue)
-- ============================================================
CREATE TYPE workflow_node_status AS ENUM (
  'pending', 'staged', 'approved', 'rejected',
  'executing', 'completed', 'failed'
);

CREATE TYPE workflow_action_type AS ENUM (
  'send_message', 'create_invoice', 'schedule_payment',
  'update_record', 'trigger_workflow', 'escalate'
);

CREATE TABLE workflow_nodes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL,
  session_id UUID REFERENCES voice_sessions(id),
  action_type workflow_action_type NOT NULL,
  status workflow_node_status NOT NULL DEFAULT 'pending',
  payload JSONB NOT NULL DEFAULT '{}',
  gs_score NUMERIC(3,2),
  gs_breakdown JSONB,
  scheduled_for TIMESTAMPTZ,
  executed_at TIMESTAMPTZ,
  result JSONB,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Composite tenant key
  CONSTRAINT unique_workspace_workflow UNIQUE (workspace_id, id)
);

-- ============================================================
-- APPROVAL QUEUE (human decision gate)
-- ============================================================
CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected', 'expired');

CREATE TABLE approval_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL,
  workflow_node_id UUID NOT NULL REFERENCES workflow_nodes(id),
  requested_by UUID NOT NULL REFERENCES profiles(id),
  reason TEXT,
  risk_score NUMERIC(3,2) NOT NULL,
  risk_breakdown JSONB NOT NULL,
  status approval_status NOT NULL DEFAULT 'pending',
  decided_by UUID REFERENCES profiles(id),
  decision_reason TEXT,
  decided_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Composite tenant key
  CONSTRAINT unique_workspace_approval UNIQUE (workspace_id, id)
);

-- ============================================================
-- COLLECTIONS LADDER (payment collection stages)
-- ============================================================
CREATE TYPE collection_stage AS ENUM (
  'initial_reminder', 'follow_up_1', 'follow_up_2',
  'final_notice', 'escalated', 'collected', 'written_off'
);

CREATE TABLE collections_ladder (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL,
  customer_entity_id UUID NOT NULL REFERENCES merchant_entities(id),
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'NGN',
  current_stage collection_stage NOT NULL DEFAULT 'initial_reminder',
  due_date DATE NOT NULL,
  last_contacted_at TIMESTAMPTZ,
  next_action_date DATE,
  metadata JSONB DEFAULT '{}',
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Composite tenant key
  CONSTRAINT unique_workspace_collection UNIQUE (workspace_id, id)
);

-- ============================================================
-- UPDATED_AT TRIGGERS
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to all tables with updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workspaces_updated_at BEFORE UPDATE ON workspaces
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_voice_sessions_updated_at BEFORE UPDATE ON voice_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_merchant_entities_updated_at BEFORE UPDATE ON merchant_entities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mesh_memories_updated_at BEFORE UPDATE ON mesh_memories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflow_nodes_updated_at BEFORE UPDATE ON workflow_nodes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_collections_ladder_updated_at BEFORE UPDATE ON collections_ladder
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- INDEXES (basic B-tree for now, HNSW in migration 002)
-- ============================================================
CREATE INDEX idx_voice_sessions_workspace ON voice_sessions(workspace_id);
CREATE INDEX idx_voice_sessions_user ON voice_sessions(user_id);
CREATE INDEX idx_voice_sessions_created ON voice_sessions(created_at DESC);

CREATE INDEX idx_merchant_entities_workspace ON merchant_entities(workspace_id);
CREATE INDEX idx_merchant_entities_type ON merchant_entities(type);
CREATE INDEX idx_merchant_entities_name ON merchant_entities(name);

CREATE INDEX idx_mesh_memories_workspace ON mesh_memories(workspace_id);
CREATE INDEX idx_mesh_memories_source ON mesh_memories(source_type, source_id);
CREATE INDEX idx_mesh_memories_tags ON mesh_memories USING GIN(tags);

CREATE INDEX idx_entity_links_workspace ON entity_links(workspace_id);
CREATE INDEX idx_entity_links_from ON entity_links(from_entity_id);
CREATE INDEX idx_entity_links_to ON entity_links(to_entity_id);

CREATE INDEX idx_workflow_nodes_workspace ON workflow_nodes(workspace_id);
CREATE INDEX idx_workflow_nodes_status ON workflow_nodes(status);
CREATE INDEX idx_workflow_nodes_scheduled ON workflow_nodes(scheduled_for) WHERE scheduled_for IS NOT NULL;

CREATE INDEX idx_approval_queue_workspace ON approval_queue(workspace_id);
CREATE INDEX idx_approval_queue_status ON approval_queue(status);
CREATE INDEX idx_approval_queue_expires ON approval_queue(expires_at) WHERE status = 'pending';

CREATE INDEX idx_collections_ladder_workspace ON collections_ladder(workspace_id);
CREATE INDEX idx_collections_ladder_stage ON collections_ladder(current_stage);
CREATE INDEX idx_collections_ladder_due ON collections_ladder(due_date);

-- ============================================================
-- COMMENTS
-- ============================================================
COMMENT ON TABLE workspaces IS 'Tenant isolation boundary - all business data belongs to a workspace';
COMMENT ON TABLE voice_sessions IS 'Raw voice session data with CME analysis results';
COMMENT ON TABLE merchant_entities IS 'Business entities (customers, suppliers, items) with semantic embeddings';
COMMENT ON TABLE mesh_memories IS 'Semantic memory store for RAG with auto-tagging';
COMMENT ON TABLE entity_links IS 'Knowledge graph edges between entities';
COMMENT ON TABLE workflow_nodes IS 'Action execution queue with Gs gate enforcement';
COMMENT ON TABLE approval_queue IS 'Human decision gate for high-risk actions (Gs >= 3.0)';
COMMENT ON TABLE collections_ladder IS 'Payment collection stage tracker with quiet hours enforcement';
