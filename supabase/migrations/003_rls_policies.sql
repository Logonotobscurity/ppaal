-- ============================================================
-- PAL: Meaning-to-Action Intelligence
-- Migration 003: Row Level Security (RLS) Policies
-- Description: FORCE RLS on all tables with tenant isolation policies
-- ============================================================

-- ============================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchant_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE mesh_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE entity_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections_ladder ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- FORCE RLS (applies to table owner/superuser too)
-- Critical for multi-tenant security
-- ============================================================
ALTER TABLE profiles FORCE ROW LEVEL SECURITY;
ALTER TABLE workspaces FORCE ROW LEVEL SECURITY;
ALTER TABLE voice_sessions FORCE ROW LEVEL SECURITY;
ALTER TABLE merchant_entities FORCE ROW LEVEL SECURITY;
ALTER TABLE mesh_memories FORCE ROW LEVEL SECURITY;
ALTER TABLE entity_links FORCE ROW LEVEL SECURITY;
ALTER TABLE workflow_nodes FORCE ROW LEVEL SECURITY;
ALTER TABLE approval_queue FORCE ROW LEVEL SECURITY;
ALTER TABLE collections_ladder FORCE ROW LEVEL SECURITY;

-- ============================================================
-- PROFILES POLICIES
-- Users can read/update their own profile
-- ============================================================
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile on signup"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- ============================================================
-- WORKSPACES POLICIES
-- Members can access workspaces they belong to
-- ============================================================
CREATE POLICY "Workspace members can view workspace"
ON workspaces FOR SELECT
USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE workspace_id = workspaces.id
  )
  OR auth.uid() = owner_id
);

CREATE POLICY "Workspace owners can update workspace"
ON workspaces FOR UPDATE
USING (auth.uid() = owner_id);

CREATE POLICY "Workspace owners can insert workspace"
ON workspaces FOR INSERT
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Workspace owners can delete workspace"
ON workspaces FOR DELETE
USING (auth.uid() = owner_id);

-- ============================================================
-- VOICE SESSIONS POLICIES
-- Workspace members can access sessions in their workspace
-- ============================================================
CREATE POLICY "Workspace members can view voice sessions"
ON voice_sessions FOR SELECT
USING (
  workspace_id IN (
    SELECT workspace_id FROM profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Workspace members can insert voice sessions"
ON voice_sessions FOR INSERT
WITH CHECK (
  workspace_id IN (
    SELECT workspace_id FROM profiles WHERE id = auth.uid()
  )
  AND auth.uid() = user_id
);

CREATE POLICY "Workspace members can update voice sessions"
ON voice_sessions FOR UPDATE
USING (
  workspace_id IN (
    SELECT workspace_id FROM profiles WHERE id = auth.uid()
  )
);

-- ============================================================
-- MERCHANT ENTITIES POLICIES
-- Workspace members can CRUD entities in their workspace
-- ============================================================
CREATE POLICY "Workspace members can view merchant entities"
ON merchant_entities FOR SELECT
USING (
  workspace_id IN (
    SELECT workspace_id FROM profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Workspace members can insert merchant entities"
ON merchant_entities FOR INSERT
WITH CHECK (
  workspace_id IN (
    SELECT workspace_id FROM profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Workspace members can update merchant entities"
ON merchant_entities FOR UPDATE
USING (
  workspace_id IN (
    SELECT workspace_id FROM profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Workspace members can delete merchant entities"
ON merchant_entities FOR DELETE
USING (
  workspace_id IN (
    SELECT workspace_id FROM profiles WHERE id = auth.uid()
  )
);

-- ============================================================
-- MESH MEMORIES POLICIES
-- Workspace members can access memories in their workspace
-- ============================================================
CREATE POLICY "Workspace members can view mesh memories"
ON mesh_memories FOR SELECT
USING (
  workspace_id IN (
    SELECT workspace_id FROM profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Workspace members can insert mesh memories"
ON mesh_memories FOR INSERT
WITH CHECK (
  workspace_id IN (
    SELECT workspace_id FROM profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Workspace members can update mesh memories"
ON mesh_memories FOR UPDATE
USING (
  workspace_id IN (
    SELECT workspace_id FROM profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Workspace members can delete mesh memories"
ON mesh_memories FOR DELETE
USING (
  workspace_id IN (
    SELECT workspace_id FROM profiles WHERE id = auth.uid()
  )
);

-- ============================================================
-- ENTITY LINKS POLICIES
-- Workspace members can manage entity relationships
-- ============================================================
CREATE POLICY "Workspace members can view entity links"
ON entity_links FOR SELECT
USING (
  workspace_id IN (
    SELECT workspace_id FROM profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Workspace members can insert entity links"
ON entity_links FOR INSERT
WITH CHECK (
  workspace_id IN (
    SELECT workspace_id FROM profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Workspace members can delete entity links"
ON entity_links FOR DELETE
USING (
  workspace_id IN (
    SELECT workspace_id FROM profiles WHERE id = auth.uid()
  )
);

-- ============================================================
-- WORKFLOW NODES POLICIES
-- Workspace members can manage workflow execution
-- ============================================================
CREATE POLICY "Workspace members can view workflow nodes"
ON workflow_nodes FOR SELECT
USING (
  workspace_id IN (
    SELECT workspace_id FROM profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Workspace members can insert workflow nodes"
ON workflow_nodes FOR INSERT
WITH CHECK (
  workspace_id IN (
    SELECT workspace_id FROM profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Workspace members can update workflow nodes"
ON workflow_nodes FOR UPDATE
USING (
  workspace_id IN (
    SELECT workspace_id FROM profiles WHERE id = auth.uid()
  )
);

-- ============================================================
-- APPROVAL QUEUE POLICIES
-- Workspace members can view and decide on approvals
-- ============================================================
CREATE POLICY "Workspace members can view approval queue"
ON approval_queue FOR SELECT
USING (
  workspace_id IN (
    SELECT workspace_id FROM profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Workspace members can request approvals"
ON approval_queue FOR INSERT
WITH CHECK (
  workspace_id IN (
    SELECT workspace_id FROM profiles WHERE id = auth.uid()
  )
  AND auth.uid() = requested_by
);

CREATE POLICY "Workspace members can decide on approvals"
ON approval_queue FOR UPDATE
USING (
  workspace_id IN (
    SELECT workspace_id FROM profiles WHERE id = auth.uid()
  )
);

-- ============================================================
-- COLLECTIONS LADDER POLICIES
-- Workspace members can manage collection stages
-- ============================================================
CREATE POLICY "Workspace members can view collections ladder"
ON collections_ladder FOR SELECT
USING (
  workspace_id IN (
    SELECT workspace_id FROM profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Workspace members can insert collections ladder"
ON collections_ladder FOR INSERT
WITH CHECK (
  workspace_id IN (
    SELECT workspace_id FROM profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Workspace members can update collections ladder"
ON collections_ladder FOR UPDATE
USING (
  workspace_id IN (
    SELECT workspace_id FROM profiles WHERE id = auth.uid()
  )
);

-- ============================================================
-- COMMENTS
-- ============================================================
COMMENT ON POLICY "Users can view own profile" ON profiles IS 'Allow users to read their own profile data';
COMMENT ON POLICY "Workspace members can view workspace" ON workspaces IS 'Tenant isolation: only members can access workspace';
COMMENT ON POLICY "Workspace members can view voice sessions" ON voice_sessions IS 'Tenant isolation: workspace-scoped voice data';
COMMENT ON POLICY "Workspace members can view merchant entities" ON merchant_entities IS 'Tenant isolation: workspace-scoped business entities';
COMMENT ON POLICY "Workspace members can view mesh memories" ON mesh_memories IS 'Tenant isolation: workspace-scoped semantic memory';
COMMENT ON POLICY "Workspace members can view workflow nodes" ON workflow_nodes IS 'Tenant isolation: workspace-scoped workflow execution';
COMMENT ON POLICY "Workspace members can view approval queue" ON approval_queue IS 'Tenant isolation: workspace-scoped approval decisions';
