# PAL Database Schema

Complete SQL schema for Supabase PostgreSQL with pgvector extension.

## Migration Files

### 001_initial_schema.sql

```sql
-- ============================================
-- PAL: Meaning-to-Action Intelligence
-- Database Schema v1.0
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";           -- For semantic memory
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements"; -- For query monitoring

-- ============================================
-- CORE TABLES
-- ============================================

-- Users (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  preferred_languages TEXT[] DEFAULT '{en,pcm}',
  timezone TEXT DEFAULT 'Africa/Lagos',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workspaces (tenant isolation)
CREATE TABLE public.workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('commerce', 'personal', 'health', 'intel')),
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- VOICE & TRANSCRIPT TABLES
-- ============================================

-- Voice sessions (raw audio metadata, not audio itself)
CREATE TABLE public.voice_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  duration_ms INTEGER,
  language_spans JSONB, -- [{text, lang, confidence, start_ms, end_ms}]
  transcript TEXT,
  mode TEXT CHECK (mode IN ('ask', 'learn', 'do')),
  gs_score NUMERIC,
  gate_outcome TEXT CHECK (gate_outcome IN ('auto_stage', 'forced_draft', 'verbal_confirmed', 'blocked')),
  gs_breakdown JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ENTITY & MEMORY TABLES
-- ============================================

-- Merchant entities (customers, suppliers, items)
CREATE TABLE public.merchant_entities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('customer', 'supplier', 'inventory_item', 'contact')),
  name TEXT NOT NULL,
  aliases TEXT[] DEFAULT '{}',
  phone TEXT,
  email TEXT,
  metadata JSONB DEFAULT '{}',
  trust_score NUMERIC DEFAULT 0.5 CHECK (trust_score >= 0 AND trust_score <= 1),
  embedding VECTOR(768), -- multilingual-e5-base
  is_demo BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workspace_id, id)
);

-- Mesh memories (Second Brain)
CREATE TABLE public.mesh_memories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id),
  content TEXT NOT NULL,
  embedding VECTOR(768),
  auto_tags TEXT[] DEFAULT '{}', -- e.g., #PriceSignal, #CustomerChurnRisk
  source_session_id UUID REFERENCES public.voice_sessions(id),
  citation_key TEXT, -- e.g., mem_892f
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Entity links (knowledge graph edges)
CREATE TABLE public.entity_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id),
  from_entity_id UUID NOT NULL REFERENCES public.merchant_entities(id),
  to_entity_id UUID NOT NULL REFERENCES public.merchant_entities(id),
  relationship TEXT NOT NULL CHECK (relationship IN ('CONTAINS', 'DEPENDS_ON', 'RELATES_TO', 'OWES', 'SUPPLIES')),
  weight NUMERIC DEFAULT 1.0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- WORKFLOW & EXECUTION TABLES
-- ============================================

-- Workflows (compiled from voice)
CREATE TABLE public.workflows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id),
  name TEXT NOT NULL,
  description TEXT,
  yaml_definition JSONB NOT NULL, -- Rein YAML workflow
  trigger_type TEXT CHECK (trigger_type IN ('manual', 'cron', 'webhook', 'voice')),
  trigger_config JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workflow runs
CREATE TABLE public.workflow_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id UUID NOT NULL REFERENCES public.workflows(id),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  source_session_id UUID REFERENCES public.voice_sessions(id),
  status TEXT NOT NULL CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
  gs_score NUMERIC,
  gs_breakdown JSONB,
  gate_outcome TEXT,
  lexicon_version UUID, -- CME version at time of execution
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workflow run steps (per-step trace)
CREATE TABLE public.workflow_run_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  run_id UUID NOT NULL REFERENCES public.workflow_runs(id),
  step_name TEXT NOT NULL,
  step_type TEXT NOT NULL,
  status TEXT NOT NULL,
  input JSONB,
  output JSONB,
  attempts INTEGER DEFAULT 1,
  error TEXT,
  executed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- COLLECTIONS & PROMISES
-- ============================================

-- Collection promises (accounts receivable)
CREATE TABLE public.collection_promises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id),
  customer_id UUID NOT NULL REFERENCES public.merchant_entities(id),
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'NGN',
  due_date TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'promised', 'settled', 'overdue', 'disputed')),
  source_session_id UUID REFERENCES public.voice_sessions(id),
  pg_boss_job_ids TEXT[], -- Array of scheduled job IDs
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- COMMERCE TABLES
-- ============================================

-- Commerce proposals (payment offers, discounts)
CREATE TABLE public.commerce_proposals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id),
  customer_id UUID NOT NULL REFERENCES public.merchant_entities(id),
  proposal_type TEXT NOT NULL CHECK (proposal_type IN ('discount', 'payment_plan', 'invoice')),
  offer JSONB NOT NULL, -- {type, value_pct, applies_to}
  expires_at TIMESTAMPTZ,
  channels TEXT[] DEFAULT '{whatsapp}',
  status TEXT DEFAULT 'draft_pending_approval',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inventory deltas
CREATE TABLE public.inventory_deltas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id),
  item_id UUID NOT NULL REFERENCES public.merchant_entities(id),
  quantity_change INTEGER NOT NULL,
  direction TEXT CHECK (direction IN ('inbound', 'outbound', 'adjustment')),
  reason TEXT,
  source_session_id UUID REFERENCES public.voice_sessions(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- LEXICON & CME TABLES
-- ============================================

-- Lexicon entries (append-only, versioned)
CREATE TABLE public.lexicon_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  version UUID NOT NULL DEFAULT uuid_generate_v4(),
  phrase TEXT NOT NULL,
  language_span TEXT NOT NULL CHECK (language_span IN ('en', 'pcm', 'yor', 'ibo', 'hau')),
  semantic_type TEXT NOT NULL CHECK (semantic_type IN ('verbatim_negation', 'fuzzy_negation', 'idiom', 'honorific')),
  mapped_intent JSONB NOT NULL, -- e.g., {"mutation": "blocked"}
  confidence_weight NUMERIC DEFAULT 1.0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- HEALTH & WELLNESS TABLES
-- ============================================

-- Founder health logs (encrypted, isolated workspace)
CREATE TABLE public.founder_health_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  energy_rating INTEGER CHECK (energy_rating >= 1 AND energy_rating <= 10),
  burnout_index NUMERIC,
  vocal_biomarkers JSONB, -- {pitch_avg, pace_wpm, stress_markers}
  journal_entry TEXT,
  sentiment_score NUMERIC,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INTEGRATION & CHANNELS
-- ============================================

-- Integration channels (WhatsApp, SMS, Email, etc.)
CREATE TABLE public.integration_channels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id),
  channel_type TEXT NOT NULL CHECK (channel_type IN ('whatsapp', 'sms', 'email', 'telegram', 'paystack', 'flutterwave')),
  credential_ref TEXT, -- Reference to secrets manager
  status TEXT DEFAULT 'not_connected' CHECK (status IN ('connected', 'not_connected', 'error')),
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Outbox (for disconnected channels)
CREATE TABLE public.outbox (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id),
  idempotency_key UUID UNIQUE NOT NULL DEFAULT uuid_generate_v4(),
  channel_type TEXT NOT NULL,
  recipient TEXT NOT NULL,
  payload JSONB NOT NULL,
  status TEXT DEFAULT 'not_connected' CHECK (status IN ('not_connected', 'queued', 'sent', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ
);

-- ============================================
-- AUDIT & RESEARCH TABLES
-- ============================================

-- Audit log (immutable)
CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id),
  user_id UUID REFERENCES public.profiles(id),
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Research run history (for hallucination auditing)
CREATE TABLE public.research_run_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id),
  query TEXT NOT NULL,
  retrieved_memory_ids UUID[],
  response TEXT,
  confidence NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_merchant_entities_updated_at
  BEFORE UPDATE ON public.merchant_entities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_collection_promises_updated_at
  BEFORE UPDATE ON public.collection_promises
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### 002_vector_extension.sql

```sql
-- ============================================
-- VECTOR INDEXES (HNSW for pgvector)
-- ============================================

-- Merchant entities embedding index
CREATE INDEX ON public.merchant_entities
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- Mesh memories embedding index
CREATE INDEX ON public.mesh_memories
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- Composite indexes for common queries
CREATE INDEX ON public.mesh_memories (workspace_id, created_at DESC);
CREATE INDEX ON public.merchant_entities (workspace_id, entity_type);
CREATE INDEX ON public.workflow_runs (workspace_id, created_at DESC);
CREATE INDEX ON public.collection_promises (workspace_id, status, due_date);
CREATE INDEX ON public.voice_sessions (workspace_id, created_at DESC);
```

### 003_rls_policies.sql

```sql
-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tenant tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merchant_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mesh_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entity_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_run_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_promises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commerce_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_deltas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.founder_health_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outbox ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_run_history ENABLE ROW LEVEL SECURITY;

-- FORCE RLS even for table owners
ALTER TABLE public.merchant_entities FORCE ROW LEVEL SECURITY;
ALTER TABLE public.mesh_memories FORCE ROW LEVEL SECURITY;
ALTER TABLE public.workflows FORCE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_runs FORCE ROW LEVEL SECURITY;
ALTER TABLE public.collection_promises FORCE ROW LEVEL SECURITY;
ALTER TABLE public.founder_health_logs FORCE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES
-- ============================================

-- Profiles: users can read/update own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Workspaces: users can access own workspaces
CREATE POLICY "Users can view own workspaces"
  ON public.workspaces FOR SELECT
  USING (owner_id = auth.uid());

CREATE POLICY "Users can create workspaces"
  ON public.workspaces FOR INSERT
  WITH CHECK (owner_id = auth.uid());

-- Generic workspace-scoped policy template
-- Applied to all workspace-scoped tables
CREATE POLICY "Workspace members can view data"
  ON public.merchant_entities FOR SELECT
  USING (
    workspace_id IN (
      SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Workspace members can insert data"
  ON public.merchant_entities FOR INSERT
  WITH CHECK (
    workspace_id IN (
      SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Workspace members can update data"
  ON public.merchant_entities FOR UPDATE
  USING (
    workspace_id IN (
      SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
    )
  );

-- Health logs: extra isolation (only owner, never shared)
CREATE POLICY "Health logs are private to owner"
  ON public.founder_health_logs FOR ALL
  USING (user_id = auth.uid());
```

### 004_indexes.sql

```sql
-- ============================================
-- PERFORMANCE INDEXES
-- ============================================

-- Additional composite indexes
CREATE INDEX idx_workflow_runs_status ON public.workflow_runs(workspace_id, status, created_at);
CREATE INDEX idx_collection_promises_due ON public.collection_promises(workspace_id, due_date, status);
CREATE INDEX idx_voice_sessions_mode ON public.voice_sessions(workspace_id, mode, created_at);
CREATE INDEX idx_mesh_memories_tags ON public.mesh_memories USING GIN (auto_tags);
CREATE INDEX idx_entity_links_relationship ON public.entity_links(workspace_id, relationship);

-- Full-text search indexes
CREATE INDEX idx_merchant_entities_name ON public.merchant_entities USING GIN (to_tsvector('english', name));
CREATE INDEX idx_mesh_memories_content ON public.mesh_memories USING GIN (to_tsvector('english', content));
```

---

## Table Relationships

```
profiles (1) ──< workspaces (1) ──< merchant_entities
                     │
                     ├──< voice_sessions
                     ├──< mesh_memories
                     ├──< workflows ──< workflow_runs ──< workflow_run_steps
                     ├──< collection_promises
                     ├──< commerce_proposals
                     ├──< inventory_deltas
                     ├──< founder_health_logs
                     ├──< integration_channels
                     └──< outbox
```

---

## Key Design Patterns

1. **Tenant Isolation:** Every table has `workspace_id` for multi-tenancy
2. **Composite Keys:** `UNIQUE(workspace_id, id)` prevents cross-tenant ID collisions
3. **Soft Deletes:** Use `updated_at` and status fields instead of hard deletes
4. **Idempotency:** `idempotency_key` in outbox prevents duplicate sends
5. **Audit Trail:** `audit_log` captures all mutations
6. **Vector Search:** HNSW indexes with `m=16, ef=64` for 768-dim embeddings
