do deep check and research for best Web search audit for chechmate and revamp : # 🏛️ PAL: Meaning-to-Action Intelligence 

## Complete Development & Architecture Specification

### Master Document for AI-Assisted Development



**Version:** 1.0.0

**Date:** February 2026

**Project:** PAL - Voice-First Business Operating System for African Commerce

**Competition:** Sahara CodeSwitch Africa Challenge 2026



---



## 📋 TABLE OF CONTENTS



1. [System Identity & Thesis](#1-system-identity--thesis)

2. [Architecture Overview](#2-architecture-overview)

3. [Technology Stack (Exact Versions)](#3-technology-stack-exact-versions)

4. [Project Structure](#4-project-structure)

5. [Database Schema](#5-database-schema)

6. [API Contracts](#6-api-contracts)

7. [Design System & Tokens](#7-design-system--tokens)

8. [Core Algorithms](#8-core-algorithms)

9. [Component Architecture](#9-component-architecture)

10. [State Management](#10-state-management)

11. [Deployment Configuration](#11-deployment-configuration)

12. [Development Workflow](#12-development-workflow)



---



## 1. SYSTEM IDENTITY & THESIS



### Core Definition

PAL is a voice-first AI operating system for African commerce. It transforms code-switched speech (English, Pidgin, Yorùbá, Igbo, Hausa mixed mid-sentence) into structured business state, deterministic agentic workflows, and founder wellness intelligence.



### The Thesis

> Better speech recognition only matters if the meaning survives into the downstream decision.



### The Pipeline

```

SPEECH → MEANING → STATE → WORKFLOW → DECISION → ACTION

```



### Three Modes (Ask/Learn/Do)

- **ASK** 🔍 — Read from memory (cited answers)

- **LEARN** 🧠 — Write to memory (unblockable)

- **DO** ⚡ — Execute actions (gated by approval)



---



## 2. ARCHITECTURE OVERVIEW



### Layer Architecture



```

┌─────────────────────────────────────────────────────────────┐

│  LAYER 0: CULTURAL MEANING ENGINE (CME)                      │

│  • Sahara STT integration                                    │

│  • Code-switch span detection                                │

│  • Verbatim/fuzzy negation parsing                           │

│  • Idiom grounding ("small small" → batch_mode)             │

│  • Versioned lexicon (append-only)                          │

└─────────────────────────────────────────────────────────────┘

                          ↓

┌─────────────────────────────────────────────────────────────┐

│  LAYER 1: ASHER COMPILER + MESH MEMORY                       │

│  • k=7 template recall (pgvector HNSW)                       │

│  • Validated DSL compilation                                 │

│  • Cron trigger resolution (Africa/Lagos TZ)                │

│  • Payment proposals with expiry rules                      │

│  • Commerce triple: InventoryDelta + SupplierJob + Ledger   │

│  • Voice Forms (dual-surface: UI + spoken)                  │

└─────────────────────────────────────────────────────────────┘

                          ↓

┌─────────────────────────────────────────────────────────────┐

│  LAYER 2: SAFEGUARD GATE (Gs)                                │

│  • Gs = 1.5·g_neg + 1.2·g_amt + 1.0·g_ch + 1.0·g_drift    │

│           + 1.1·g_health                                    │

│  • g_drift: calibrated transcript↔readback distance         │

│  • g_health: opt-in, verbal-confirm only                    │

│  • Gs ≥ 3.0 → forced draft + confirmation                  │

│  • gs_breakdown persisted per run                           │

└─────────────────────────────────────────────────────────────┘

                          ↓

┌─────────────────────────────────────────────────────────────┐

│  LAYER 3: DURABLE EXECUTOR                                   │

│  • pg-boss: cron/delayed/event jobs                         │

│  • Collections ladder: T-1, T-0, overdue+2                  │

│  • Quiet hours: 21:00-08:00 WAT                             │

│  • Spend cap: transactional per-tenant                      │

│  • Idempotency keys on every action                         │

│  • Settle-then-cancel in ONE transaction                    │

└─────────────────────────────────────────────────────────────┘

                          ↓

┌─────────────────────────────────────────────────────────────┐

│  LAYER 4: POSTGRES SPINE                                     │

│  • Supabase (PostgreSQL + Auth + Realtime)                  │

│  • pgvector extension for semantic memory                   │

│  • RLS + FORCE ROW LEVEL SECURITY                           │

│  • Composite tenant foreign keys                            │

│  • HNSW indexes (vector_cosine_ops, m=16, ef=64)           │

└─────────────────────────────────────────────────────────────┘

                          ↓

┌─────────────────────────────────────────────────────────────┐

│  LAYER 5: USER SURFACE                                       │

│  • Command (voice-first home)                               │

│  • Workspace (meaning + workflow canvas)                    │

│  • Approvals (human decision gate)                          │

│  • Intelligence (benchmark + failure replay)                │

│  • Activity (audit trail)                                   │

└─────────────────────────────────────────────────────────────┘

```



---



## 3. TECHNOLOGY STACK (Exact Versions)



### Frontend Stack

```json

{

  "framework": "React 18.3.1",

  "buildTool": "Vite 5.4.0",

  "language": "TypeScript 5.5.4",

  "routing": "react-router-dom 6.26.0",

  "stateManagement": {

    "server": "@tanstack/react-query 5.51.21",

    "global": "zustand 4.5.4",

    "local": "React useState/useReducer"

  },

  "uiLibrary": "shadcn/ui (Radix UI primitives)",

  "styling": "Tailwind CSS 3.4.9",

  "icons": "lucide-react 0.427.0",

  "charts": "recharts 2.12.7",

  "animations": "framer-motion 11.3.24",

  "forms": "react-hook-form 7.52.2 + zod 3.23.8",

  "voice": {

    "capture": "Web Audio API + MediaRecorder",

    "streaming": "WebSocket (native)",

    "stt": "Sahara CodeSwitch API",

    "tts": "Web Speech API (fallback) + Coqui"

  }

}

```



### Backend Stack

```json

{

  "database": "Supabase PostgreSQL 15+",

  "extensions": ["pgvector 0.7.0", "pgcrypto", "pg_stat_statements"],

  "auth": "Supabase Auth (JWT + OAuth)",

  "realtime": "Supabase Realtime (WebSocket)",

  "vectorEmbeddings": "multilingual-e5-base (768-dim)",

  "llmProviders": {

    "primary": "Claude 3.5 Sonnet",

    "fallback": "Gemini 1.5 Flash",

    "local": "Ollama (llama3.1:8b)"

  },

  "voiceProcessing": {

    "stt": "Sahara CodeSwitch Streaming API",

    "tts": "Coqui TTS (local) + Web Speech API"

  },

  "jobQueue": "pg-boss 9.0.0",

  "validation": "Zod 3.23.8"

}

```



### Infrastructure

```json

{

  "hosting": "Vercel (frontend + edge functions)",

  "database": "Supabase (managed PostgreSQL)",

  "cdn": "Vercel Edge Network",

  "monitoring": "Sentry (error tracking)",

  "analytics": "PostHog (optional)",

  "cicd": "GitHub Actions"

}

```



---



## 4. PROJECT STRUCTURE



```

pal-meaning-to-action/

│

├── .github/

│   └── workflows/

│       ├── ci.yml                    # Lint + test + type-check on PR

│       └── deploy.yml                # Vercel deployment on merge to main

│

├── backend/                          # FastAPI WebSocket proxy

│   ├── .env.example

│   ├── requirements.txt

│   ├── main.py                       # FastAPI app + WebSocket endpoint

│   ├── sahara_client.py              # Sahara streaming API wrapper

│   └── config.py                     # Settings from .env

│

├── src/

│   ├── app/                          # Application shell

│   │   ├── layout.tsx                # Root layout with providers

│   │   ├── page.tsx                  # Landing page

│   │   ├── globals.css               # Global styles + tokens

│   │   └── (dashboard)/              # Protected routes

│   │       ├── layout.tsx            # Dashboard layout with sidebar

│   │       ├── command/page.tsx      # Command screen (voice home)

│   │       ├── workspace/page.tsx    # Workspace canvas ★

│   │       ├── approvals/page.tsx    # Approval gate

│   │       ├── intelligence/page.tsx # Benchmark dashboard

│   │       ├── activity/page.tsx     # Audit trail

│   │       └── settings/page.tsx     # Settings

│   │

│   ├── components/

│   │   ├── ui/                       # shadcn/ui components (copy-paste)

│   │   │   ├── button.tsx

│   │   │   ├── card.tsx

│   │   │   ├── dialog.tsx

│   │   │   ├── input.tsx

│   │   │   ├── badge.tsx

│   │   │   ├── tabs.tsx

│   │   │   └── ... (30+ components)

│   │   │

│   │   ├── voice/                    # Voice-specific components

│   │   │   ├── command-orb.tsx       # The main voice button

│   │   │   ├── live-session.tsx      # Full-screen recording UI

│   │   │   ├── waveform.tsx          # Audio visualization

│   │   │   └── transcript-stream.tsx # Real-time transcript display

│   │   │

│   │   ├── workspace/                # Workspace canvas components

│   │   │   ├── speech-panel.tsx      # "What I heard" column

│   │   │   ├── meaning-panel.tsx     # Entity chips + constraints

│   │   │   ├── action-panel.tsx      # Workflow nodes

│   │   │   ├── entity-chip.tsx       # Clickable entity with confidence

│   │   │   ├── workflow-node.tsx     # Single workflow step

│   │   │   └── meaning-inspector.tsx # Detail modal for entities

│   │   │

│   │   ├── approvals/                # Approval gate components

│   │   │   ├── approval-card.tsx     # Single action proposal

│   │   │   ├── risk-indicator.tsx    # Gs score visualization

│   │   │   └── constraint-display.tsx

│   │   │

│   │   ├── intelligence/             # Benchmark components

│   │   │   ├── model-comparison.tsx  # Sahara vs Whisper vs M4T

│   │   │   ├── failure-replay.tsx    # Side-by-side failure demo

│   │   │   └── metrics-table.tsx

│   │   │

│   │   ├── mobile/                   # Mobile-specific components

│   │   │   ├── workflow-cards.tsx    # Swipeable card carousel

│   │   │   └── bottom-nav.tsx        # Mobile navigation

│   │   │

│   │   └── layout/                   # Layout components

│   │       ├── sidebar.tsx           # Desktop sidebar

│   │       ├── header.tsx

│   │       └── page-shell.tsx

│   │

│   ├── hooks/                        # Custom React hooks

│   │   ├── use-sahara.ts             # Voice capture + streaming ★

│   │   ├── use-meaning-engine.ts     # Entity extraction

│   │   ├── use-workspace.ts          # Workspace state

│   │   ├── use-approvals.ts          # Approval queue

│   │   ├── use-semantic-memory.ts    # pgvector queries

│   │   ├── use-media-query.ts        # Responsive breakpoint

│   │   └── use-toast.ts              # Notifications

│   │

│   ├── lib/                          # Utilities & configuration

│   │   ├── supabase/

│   │   │   ├── client.ts             # Supabase browser client

│   │   │   ├── server.ts             # Supabase server client

│   │   │   └── middleware.ts         # Auth middleware

│   │   │

│   │   ├── meaning-engine/

│   │   │   ├── cme.ts                # Cultural Meaning Engine

│   │   │   ├── negation-parser.ts    # Verbatim/fuzzy negation

│   │   │   ├── idiom-grounding.ts    # Idiom → semantic mapping

│   │   │   ├── entity-extractor.ts   # LLM-based extraction

│   │   │   └── gs-gate.ts            # Safeguard Gate calculation

│   │   │

│   │   ├── memory/

│   │   │   ├── vector-store.ts       # pgvector operations

│   │   │   ├── embeddings.ts         # multilingual-e5-base

│   │   │   └── auto-tagger.ts        # k-NN auto-tagging

│   │   │

│   │   ├── executor/

│   │   │   ├── workflow-compiler.ts  # Intent → workflow YAML

│   │   │   ├── job-scheduler.ts      # pg-boss integration

│   │   │   └── channel-dispatch.ts   # WhatsApp/SMS/Email

│   │   │

│   │   ├── utils.ts                  # General utilities

│   │   ├── constants.ts              # App constants

│   │   └── validators.ts             # Zod schemas

│   │

│   ├── stores/                       # Zustand stores

│   │   ├── voice-store.ts            # Global voice state

│   │   ├── workspace-store.ts        # Workspace state

│   │   └── approval-store.ts         # Approval queue

│   │

│   ├── types/                        # TypeScript types

│   │   ├── api.ts                    # API response types

│   │   ├── voice.ts                  # Voice/transcript types

│   │   ├── meaning.ts                # Entity/constraint types

│   │   ├── workflow.ts               # Workflow types

│   │   └── database.ts               # Supabase generated types

│   │

│   └── styles/

│       └── tokens.css                # Design tokens (CSS variables)

│

├── public/

│   ├── icons/                        # SVG icons

│   └── audio/                        # Demo audio files

│

├── supabase/

│   ├── migrations/

│   │   ├── 001_initial_schema.sql    # Core tables

│   │   ├── 002_vector_extension.sql  # pgvector setup

│   │   ├── 003_rls_policies.sql      # Row-level security

│   │   └── 004_indexes.sql           # Performance indexes

│   ├── seed.sql                      # Demo data

│   └── config.toml                   # Supabase config

│

├── tests/

│   ├── unit/

│   │   ├── cme.test.ts

│   │   ├── gs-gate.test.ts

│   │   └── entity-extractor.test.ts

│   ├── integration/

│   │   ├── voice-flow.test.ts

│   │   └── approval-flow.test.ts

│   └── e2e/

│       └── demo-flow.spec.ts         # Playwright E2E

│

├── .env.example

├── .env.local                        # Local dev (gitignored)

├── package.json

├── tsconfig.json

├── vite.config.ts

├── tailwind.config.ts

├── postcss.config.js

├── components.json                   # shadcn/ui config

└── README.md

```



---



## 5. DATABASE SCHEMA



### `supabase/migrations/001_initial_schema.sql`



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

-- UPDATED_AT TRIGGER

-- ============================================



CREATE OR REPLACE FUNCTION update_updated_at()

RETURNS TRIGGER AS $$

BEGIN

  NEW.updated_at = NOW();

  RETURN NEW;

END;

$$ LANGUAGE plpgsql;



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



### `supabase/migrations/002_vector_extension.sql`



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



### `supabase/migrations/003_rls_policies.sql`



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



-- Repeat similar policies for all workspace-scoped tables...

-- (Abbreviated for brevity - apply same pattern to all tables)



-- Health logs: extra isolation (only owner, never shared)

CREATE POLICY "Health logs are private to owner"

  ON public.founder_health_logs FOR ALL

  USING (user_id = auth.uid());

```



---



## 6. API CONTRACTS



### 6.1 WebSocket Protocol (Voice Streaming)



**Endpoint:** `wss://your-backend/ws/transcribe`



#### Client → Server Messages



```typescript

// Audio chunk (binary)

type AudioChunk = Blob; // webm/opus, 250ms chunks



// Control message

interface ControlMessage {

  type: "end_of_stream";

}

```



#### Server → Client Messages



```typescript

interface AckMessage {

  type: "ack";

}



interface PartialTranscript {

  type: "partial";

  text: string;

}



interface FinalTranscript {

  type: "final";

  text: string;

  lang: string; // e.g., "en+pcm"

  codeswitch: boolean;

  language_spans?: Array<{

    text: string;

    lang: "en" | "pcm" | "yor" | "ibo" | "hau";

    confidence: number;

    start_ms: number;

    end_ms: number;

  }>;

}



interface ErrorMessage {

  type: "error";

  message: string;

}



type ServerMessage = AckMessage | PartialTranscript | FinalTranscript | ErrorMessage;

```



### 6.2 REST API Endpoints



#### Meaning Engine



```typescript

// POST /api/interpret

interface InterpretRequest {

  transcript: string;

  language_spans: LanguageSpan[];

  workspace_id: string;

  mode: "ask" | "learn" | "do";

}



interface InterpretResponse {

  entities: Entity[];

  constraints: Constraint[];

  intent: Intent;

  gs_score: number;

  gs_breakdown: GsBreakdown;

  gate_outcome: "auto_stage" | "forced_draft" | "verbal_confirmed" | "blocked";

  proposed_actions: ProposedAction[];

}



interface Entity {

  id: string;

  type: "customer" | "amount" | "date" | "item" | "commitment";

  value: string | number;

  confidence: number;

  evidence: { start_ms: number; end_ms: number };

  mode: "ask" | "learn" | "do";

}



interface Constraint {

  id: string;

  type: "temporal_block" | "negation" | "conditional";

  target_entity_id: string;

  condition: string;

  severity: "hard_block" | "soft_warning";

}



interface GsBreakdown {

  g_neg: number;

  g_amt: number;

  g_ch: number;

  g_drift: number;

  g_health: number;

  weights: {

    neg: 1.5;

    amt: 1.2;

    ch: 1.0;

    drift: 1.0;

    health: 1.1;

  };

}

```



#### Semantic Memory



```typescript

// POST /api/memory/search

interface MemorySearchRequest {

  query: string;

  workspace_id: string;

  k: number; // default 7

  tags?: string[];

}



interface MemorySearchResponse {

  results: Array<{

    id: string;

    content: string;

    score: number;

    tags: string[];

    citation_key: string;

  }>;

}



// POST /api/memory/store

interface MemoryStoreRequest {

  content: string;

  workspace_id: string;

  tags?: string[];

  source_session_id?: string;

}



interface MemoryStoreResponse {

  id: string;

  citation_key: string;

  embedding_id: string;

}

```



#### Approvals



```typescript

// GET /api/approvals

interface ApprovalsResponse {

  pending: Array<{

    id: string;

    action_type: string;

    description: string;

    risk_level: "low" | "medium" | "high";

    gs_score: number;

    created_at: string;

  }>;

}



// POST /api/approvals/:id/resolve

interface ResolveApprovalRequest {

  verdict: "approve" | "reject" | "revise";

  revision?: {

    field: string;

    new_value: any;

  };

}

```



---



## 7. DESIGN SYSTEM & TOKENS



### CSS Variables (`src/styles/tokens.css`)



```css

:root {

  /* Core palette */

  --ivory: #FAF7F2;

  --charcoal: #16151A;

  --violet: #6C3DF4;

  --teal: #2E8B8B;

  --amber: #D97706;

  --red: #DC2626;

  

  /* Semantic colors */

  --color-understood: var(--teal);

  --color-thinking: var(--violet);

  --color-uncertain: var(--amber);

  --color-blocked: var(--red);

  

  /* Typography */

  --font-ui: 'DM Sans', system-ui, sans-serif;

  --font-editorial: 'Cormorant Garamond', serif;

  --font-mono: 'JetBrains Mono', monospace;

  

  /* Spacing */

  --space-1: 4px;

  --space-2: 8px;

  --space-3: 12px;

  --space-4: 16px;

  --space-5: 20px;

  --space-6: 24px;

  --space-8: 32px;

  --space-10: 40px;

  --space-12: 48px;

  --space-16: 64px;

  

  /* Borders */

  --radius-sm: 8px;

  --radius-md: 12px;

  --radius-lg: 16px;

  --radius-xl: 20px;

  --radius-full: 9999px;

  

  --line: rgba(22, 21, 26, 0.12);

  

  /* Shadows */

  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.04);

  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);

  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.12);

  

  /* Animations */

  --transition-fast: 150ms ease;

  --transition-base: 250ms ease;

  --transition-slow: 400ms ease;

}



/* Dark mode (for Intelligence/Benchmark screens) */

.dark {

  --ivory: #16151A;

  --charcoal: #FAF7F2;

  --line: rgba(250, 247, 242, 0.12);

}

```



### Tailwind Config (`tailwind.config.ts`)



```typescript

import type { Config } from 'tailwindcss'



const config: Config = {

  darkMode: 'class',

  content: [

    './src/**/*.{js,ts,jsx,tsx,mdx}',

  ],

  theme: {

    extend: {

      colors: {

        ivory: 'var(--ivory)',

        charcoal: 'var(--charcoal)',

        violet: 'var(--violet)',

        teal: 'var(--teal)',

        amber: 'var(--amber)',

        red: 'var(--red)',

      },

      fontFamily: {

        ui: ['var(--font-ui)'],

        editorial: ['var(--font-editorial)'],

        mono: ['var(--font-mono)'],

      },

      borderRadius: {

        sm: 'var(--radius-sm)',

        md: 'var(--radius-md)',

        lg: 'var(--radius-lg)',

        xl: 'var(--radius-xl)',

      },

      animation: {

        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',

        'orb-idle': 'orb-idle 3s infinite',

        'orb-rec': 'orb-rec 1.1s infinite',

      },

      keyframes: {

        'orb-idle': {

          '0%, 100%': { boxShadow: '0 0 0 0 rgba(108, 61, 244, 0.25)' },

          '50%': { boxShadow: '0 0 0 24px rgba(108, 61, 244, 0)' },

        },

        'orb-rec': {

          '0%, 100%': { boxShadow: '0 0 0 0 rgba(108, 61, 244, 0.5)' },

          '50%': { boxShadow: '0 0 0 30px rgba(108, 61, 244, 0)' },

        },

      },

    },

  },

  plugins: [],

}



export default config

```



---



## 8. CORE ALGORITHMS



### 8.1 Cultural Meaning Engine (`src/lib/meaning-engine/cme.ts`)



```typescript

import { z } from 'zod';



// Language span from Sahara STT

export const LanguageSpanSchema = z.object({

  text: z.string(),

  lang: z.enum(['en', 'pcm', 'yor', 'ibo', 'hau']),

  confidence: z.number().min(0).max(1),

  start_ms: z.number(),

  end_ms: z.number(),

});



export type LanguageSpan = z.infer<typeof LanguageSpanSchema>;



// CME Result

export interface CMEResult {

  verbatim_negations: Negation[];

  fuzzy_negations: Negation[];

  idioms: IdiomMapping[];

  constraints: Constraint[];

  lexicon_version: string;

}



export interface Negation {

  phrase: string;

  span: LanguageSpan;

  confidence: number;

  target?: string; // Entity being negated

}



export interface IdiomMapping {

  original: string;

  grounded: string;

  semantic_type: string;

}



export interface Constraint {

  type: 'temporal_block' | 'negation' | 'conditional';

  target_entity?: string;

  condition: string;

  severity: 'hard_block' | 'soft_warning';

}



// Negation lexicon (verbatim matches = hard block)

const VERBATIM_NEGATIONS = [

  { pattern: /no send am/i, lang: 'pcm', meaning: 'do_not_send' },

  { pattern: /ma se/i, lang: 'yor', meaning: 'do_not_do' },

  { pattern: /don't send/i, lang: 'en', meaning: 'do_not_send' },

  { pattern: /no do am/i, lang: 'pcm', meaning: 'do_not_execute' },

  { pattern: /never/i, lang: 'en', meaning: 'never_execute' },

];



// Idiom grounding table

const IDIOM_MAP = [

  { pattern: /small small/i, lang: 'pcm', grounded: 'batch_mode', type: 'execution_modifier' },

  { pattern: /abeg hold am/i, lang: 'pcm', grounded: 'status_paused', type: 'status_modifier' },

  { pattern: /e go pay/i, lang: 'pcm', grounded: 'payment_commitment', type: 'commitment' },

  { pattern: /shenk am/i, lang: 'pcm', grounded: 'approve', type: 'approval' },

];



export class CulturalMeaningEngine {

  private lexicon_version: string;

  

  constructor() {

    this.lexicon_version = 'v1.0.0'; // Would be loaded from DB

  }



  async parse(transcript: string, language_spans: LanguageSpan[]): Promise<CMEResult> {

    const verbatim_negations: Negation[] = [];

    const fuzzy_negations: Negation[] = [];

    const idioms: IdiomMapping[] = [];

    const constraints: Constraint[] = [];



    // 1. Process each language span

    for (const span of language_spans) {

      // Check verbatim negations

      for (const neg of VERBATIM_NEGATIONS) {

        if (neg.lang === span.lang && neg.pattern.test(span.text)) {

          verbatim_negations.push({

            phrase: span.text.match(neg.pattern)?.[0] || '',

            span,

            confidence: 1.0,

          });

          

          // Verbatim negations create hard-block constraints

          constraints.push({

            type: 'negation',

            condition: neg.meaning,

            severity: 'hard_block',

          });

        }

      }



      // Check idioms

      for (const idiom of IDIOM_MAP) {

        if (idiom.lang === span.lang && idiom.pattern.test(span.text)) {

          idioms.push({

            original: span.text.match(idiom.pattern)?.[0] || '',

            grounded: idiom.grounded,

            semantic_type: idiom.type,

          });

        }

      }

    }



    // 2. Fuzzy negation detection (lower confidence)

    const fuzzyPatterns = [

      { pattern: /wait|hold on|later/i, meaning: 'delay_execution' },

      { pattern: /maybe|perhaps/i, meaning: 'uncertain' },

    ];



    for (const pattern of fuzzyPatterns) {

      if (pattern.pattern.test(transcript)) {

        fuzzy_negations.push({

          phrase: transcript.match(pattern.pattern)?.[0] || '',

          span: language_spans[0], // Simplified

          confidence: 0.6,

        });

      }

    }



    return {

      verbatim_negations,

      fuzzy_negations,

      idioms,

      constraints,

      lexicon_version: this.lexicon_version,

    };

  }

}

```



### 8.2 Safeguard Gate (`src/lib/meaning-engine/gs-gate.ts`)



```typescript

export interface GsBreakdown {

  g_neg: number;

  g_amt: number;

  g_ch: number;

  g_drift: number;

  g_health: number;

  weights: {

    neg: 1.5;

    amt: 1.2;

    ch: 1.0;

    drift: 1.0;

    health: 1.1;

  };

  total: number;

}



export interface GsGateResult {

  score: number;

  breakdown: GsBreakdown;

  gate_outcome: 'auto_stage' | 'forced_draft' | 'verbal_confirmed' | 'blocked';

  requires_confirmation: boolean;

}



export interface GsGateInput {

  negation_count: number;

  amount_deviation: number; // % deviation from historical average

  channel_connected: boolean;

  transcript_drift: number; // 0-1, cosine distance from readback

  health_score?: number; // 0-1, founder wellness (opt-in)

}



const WEIGHTS = {

  neg: 1.5,

  amt: 1.2,

  ch: 1.0,

  drift: 1.0,

  health: 1.1,

} as const;



const THRESHOLDS = {

  auto_stage: 3.0,

  verbal_confirm: 5.0,

  blocked: 7.0,

} as const;



export class SafeguardGate {

  calculate(input: GsGateInput): GsGateResult {

    // Calculate individual components

    const g_neg = input.negation_count * 0.5; // Each negation adds 0.5

    const g_amt = Math.min(input.amount_deviation / 10, 2); // Cap at 2

    const g_ch = input.channel_connected ? 0 : 1;

    const g_drift = input.transcript_drift;

    const g_health = input.health_score ? (1 - input.health_score) * 0.5 : 0;



    // Calculate weighted total

    const total = 

      WEIGHTS.neg * g_neg +

      WEIGHTS.amt * g_amt +

      WEIGHTS.ch * g_ch +

      WEIGHTS.drift * g_drift +

      WEIGHTS.health * g_health;



    // Determine gate outcome

    let gate_outcome: GsGateResult['gate_outcome'];

    let requires_confirmation = false;



    if (total >= THRESHOLDS.blocked) {

      gate_outcome = 'blocked';

      requires_confirmation = true;

    } else if (total >= THRESHOLDS.verbal_confirm) {

      gate_outcome = 'verbal_confirmed';

      requires_confirmation = true;

    } else if (total >= THRESHOLDS.auto_stage) {

      gate_outcome = 'forced_draft';

      requires_confirmation = true;

    } else {

      gate_outcome = 'auto_stage';

      requires_confirmation = false;

    }



    return {

      score: Math.round(total * 100) / 100,

      breakdown: {

        g_neg,

        g_amt,

        g_ch,

        g_drift,

        g_health,

        weights: WEIGHTS,

        total,

      },

      gate_outcome,

      requires_confirmation,

    };

  }

}

```



### 8.3 Entity Extractor (`src/lib/meaning-engine/entity-extractor.ts`)



```typescript

import { z } from 'zod';



export const EntitySchema = z.object({

  id: z.string(),

  type: z.enum(['customer', 'amount', 'date', 'item', 'commitment', 'constraint']),

  value: z.union([z.string(), z.number()]),

  confidence: z.number().min(0).max(1),

  evidence: z.object({

    start_ms: z.number(),

    end_ms: z.number(),

  }),

  mode: z.enum(['ask', 'learn', 'do']),

});



export type Entity = z.infer<typeof EntitySchema>;



// Prompt for LLM-based extraction

const EXTRACTION_PROMPT = `You are a business entity extractor for African commerce.

Given a transcript (which may contain Pidgin, Yoruba, Hausa, Igbo, or English code-switching),

extract the following entities as JSON:



- customer: person or business name

- amount: monetary value (normalize to numbers, e.g., "85k" → 85000)

- date: temporal reference (normalize to ISO format or relative like "friday")

- item: product or service

- commitment: promise or obligation

- constraint: limitation or condition (especially negations)



Return ONLY valid JSON array. No markdown, no commentary.



Example input: "Ngozi still dey owe me eighty-five thousand. Remind Musa about invoice, but no send am today."

Example output: [

  {"type": "customer", "value": "Ngozi", "confidence": 0.95},

  {"type": "amount", "value": 85000, "confidence": 0.92},

  {"type": "customer", "value": "Musa", "confidence": 0.95},

  {"type": "constraint", "value": "do_not_send_today", "confidence": 0.98}

]



Transcript: `;



export class EntityExtractor {

  constructor(private llmProvider: 'claude' | 'gemini' | 'ollama') {}



  async extract(transcript: string, cmeResult: CMEResult): Promise<Entity[]> {

    // Combine transcript with CME constraints

    const enrichedPrompt = EXTRACTION_PROMPT + transcript + 

      '\n\nCME detected constraints: ' + JSON.stringify(cmeResult.constraints);



    // Call LLM (implementation depends on provider)

    const response = await this.callLLM(enrichedPrompt);

    

    // Parse and validate

    const raw = JSON.parse(response);

    const entities: Entity[] = raw.map((e: any, i: number) => ({

      id: `entity_${i}`,

      type: e.type,

      value: e.value,

      confidence: e.confidence,

      evidence: { start_ms: 0, end_ms: 0 }, // Would be calculated from spans

      mode: this.determineMode(e.type),

    }));



    return entities;

  }



  private determineMode(type: string): 'ask' | 'learn' | 'do' {

    if (type === 'constraint' || type === 'commitment') return 'do';

    if (type === 'customer' || type === 'item') return 'learn';

    return 'ask';

  }



  private async callLLM(prompt: string): Promise<string> {

    // Implementation depends on provider

    // This is a placeholder - wire up to actual LLM API

    throw new Error('LLM provider not configured');

  }

}

```



---



## 9. COMPONENT ARCHITECTURE



### 9.1 Command Orb (`src/components/voice/command-orb.tsx`)



```tsx

'use client';



import { useState } from 'react';

import { useVoiceStore } from '@/stores/voice-store';

import { cn } from '@/lib/utils';



type OrbState = 'idle' | 'listening' | 'understanding' | 'review';



export function CommandOrb({ onActivate }: { onActivate: () => void }) {

  const { state } = useVoiceStore();

  

  const stateLabels: Record<OrbState, string> = {

    idle: 'Speak',

    listening: 'Listening',

    understanding: 'Understanding',

    review: 'Ready for review',

  };



  return (

    <div className="flex flex-col items-center gap-6">

      <button

        onClick={state === 'idle' ? onActivate : undefined}

        className={cn(

          'w-40 h-40 rounded-full border-none cursor-pointer',

          'bg-gradient-radial from-[#2b2933] to-charcoal',

          'text-ivory text-4xl',

          'transition-all duration-300',

          state === 'idle' && 'animate-orb-idle',

          state === 'listening' && 'animate-orb-rec text-violet',

          state === 'understanding' && 'animate-orb-rec',

          state === 'review' && 'ring-4 ring-teal/50'

        )}

        aria-label={stateLabels[state]}

      >

        <span className="orb-inner">◉</span>

      </button>

      

      <p className="text-charcoal font-bold text-lg">{stateLabels[state]}</p>

      <p className="text-muted text-sm">

        Ask · Learn · Do — just talk. PAL knows which mode you're in.

      </p>

    </div>

  );

}

```



### 9.2 Workspace Canvas (`src/app/(dashboard)/workspace/page.tsx`)



```tsx

'use client';



import { useWorkspaceStore } from '@/stores/workspace-store';

import { SpeechPanel } from '@/components/workspace/speech-panel';

import { MeaningPanel } from '@/components/workspace/meaning-panel';

import { ActionPanel } from '@/components/workspace/action-panel';

import { MeaningInspector } from '@/components/workspace/meaning-inspector';

import { MobileWorkflowCards } from '@/components/mobile/workflow-cards';

import { useMediaQuery } from '@/hooks/use-media-query';



export default function WorkspacePage() {

  const { transcript, entities, constraints, workflow, selectedEntity, setSelectedEntity } = useWorkspaceStore();

  const isMobile = useMediaQuery('(max-width: 900px)');



  return (

    <div className="h-full flex flex-col">

      {/* Header */}

      <div className="flex items-center justify-between mb-6">

        <h1 className="text-2xl font-bold text-charcoal">Workspace</h1>

        <span className="text-xs font-mono px-3 py-1 rounded-full border border-line">

          <span className="inline-block w-2 h-2 rounded-full bg-teal animate-pulse mr-2" />

          LIVE

        </span>

      </div>



      {/* Desktop: 3-column grid */}

      {!isMobile && (

        <div className="grid grid-cols-3 gap-6 flex-1">

          <SpeechPanel 

            transcript={transcript}

            onCorrect={(correction) => {

              // Handle voice correction

            }}

          />

          <MeaningPanel 

            entities={entities}

            constraints={constraints}

            onEntityClick={setSelectedEntity}

          />

          <ActionPanel workflow={workflow} />

        </div>

      )}



      {/* Mobile: Stacked with swipeable cards */}

      {isMobile && (

        <div className="flex flex-col gap-4 flex-1">

          <SpeechPanel transcript={transcript} compact />

          <MeaningPanel entities={entities} constraints={constraints} compact />

          <MobileWorkflowCards workflow={workflow} />

        </div>

      )}



      {/* Meaning Inspector Modal */}

      {selectedEntity && (

        <MeaningInspector 

          entity={selectedEntity}

          onClose={() => setSelectedEntity(null)}

        />

      )}

    </div>

  );

}

```



---



## 10. STATE MANAGEMENT



### 10.1 Voice Store (`src/stores/voice-store.ts`)



```typescript

import { create } from 'zustand';

import { persist } from 'zustand/middleware';



type VoiceState = 'idle' | 'listening' | 'understanding' | 'review';



interface VoiceStore {

  // State

  state: VoiceState;

  transcript: string;

  languageInfo: {

    lang: string;

    codeswitch: boolean | null;

  };

  

  // Actions

  setState: (state: VoiceState) => void;

  setTranscript: (transcript: string) => void;

  setLanguageInfo: (info: { lang: string; codeswitch: boolean | null }) => void;

  reset: () => void;

}



export const useVoiceStore = create<VoiceStore>()(

  persist(

    (set) => ({

      // Initial state

      state: 'idle',

      transcript: '',

      languageInfo: { lang: '—', codeswitch: null },

      

      // Actions

      setState: (state) => set({ state }),

      setTranscript: (transcript) => set({ transcript }),

      setLanguageInfo: (languageInfo) => set({ languageInfo }),

      reset: () => set({

        state: 'idle',

        transcript: '',

        languageInfo: { lang: '—', codeswitch: null },

      }),

    }),

    {

      name: 'pal-voice-store',

      partialize: (state) => ({

        // Only persist certain fields

        languageInfo: state.languageInfo,

      }),

    }

  )

);

```



### 10.2 Workspace Store (`src/stores/workspace-store.ts`)



```typescript

import { create } from 'zustand';

import type { Entity, Constraint, WorkflowNode } from '@/types/meaning';



interface WorkspaceStore {

  // State

  transcript: string;

  entities: Entity[];

  constraints: Constraint[];

  workflow: WorkflowNode[];

  selectedEntity: Entity | null;

  gsScore: number | null;

  gateOutcome: string | null;

  

  // Actions

  setTranscript: (transcript: string) => void;

  setEntities: (entities: Entity[]) => void;

  setConstraints: (constraints: Constraint[]) => void;

  setWorkflow: (workflow: WorkflowNode[]) => void;

  setSelectedEntity: (entity: Entity | null) => void;

  setGsResult: (score: number, outcome: string) => void;

  updateWorkflowNode: (nodeId: string, updates: Partial<WorkflowNode>) => void;

  reset: () => void;

}



export const useWorkspaceStore = create<WorkspaceStore>((set) => ({

  // Initial state

  transcript: '',

  entities: [],

  constraints: [],

  workflow: [],

  selectedEntity: null,

  gsScore: null,

  gateOutcome: null,

  

  // Actions

  setTranscript: (transcript) => set({ transcript }),

  setEntities: (entities) => set({ entities }),

  setConstraints: (constraints) => set({ constraints }),

  setWorkflow: (workflow) => set({ workflow }),

  setSelectedEntity: (selectedEntity) => set({ selectedEntity }),

  setGsResult: (gsScore, gateOutcome) => set({ gsScore, gateOutcome }),

  updateWorkflowNode: (nodeId, updates) => set((state) => ({

    workflow: state.workflow.map(node => 

      node.id === nodeId ? { ...node, ...updates } : node

    ),

  })),

  reset: () => set({

    transcript: '',

    entities: [],

    constraints: [],

    workflow: [],

    selectedEntity: null,

    gsScore: null,

    gateOutcome: null,

  }),

}));

```



---



## 11. DEPLOYMENT CONFIGURATION



### `vercel.json`



```json

{

  "framework": "nextjs",

  "regions": ["iad1", "sfo1"],

  "headers": [

    {

      "source": "/api/(.*)",

      "headers": [

        { "key": "Cache-Control", "value": "no-store" },

        { "key": "X-Content-Type-Options", "value": "nosniff" }

      ]

    }

  ]

}

```



### `.env.example`



```env

# Supabase

NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

SUPABASE_SERVICE_ROLE_KEY=your-service-role-key



# Sahara CodeSwitch API

SAHARA_API_KEY=your-sahara-key

SAHARA_WS_URL=wss://api.sahara.intron.io/v1/stream

SAHARA_MODEL=afriswitch-v1



# Backend WebSocket proxy

NEXT_PUBLIC_BACKEND_WS_URL=ws://localhost:8000/ws/transcribe



# LLM Providers

ANTHROPIC_API_KEY=your-claude-key

GOOGLE_AI_API_KEY=your-gemini-key

OLLAMA_BASE_URL=http://localhost:11434



# Optional

SENTRY_DSN=your-sentry-dsn

POSTHOG_KEY=your-posthog-key

```



---



## 12. DEVELOPMENT WORKFLOW



### Getting Started



```bash

# 1. Clone and install

git clone https://github.com/yourusername/pal-meaning-to-action.git

cd pal-meaning-to-action

npm install



# 2. Set up environment

cp .env.example .env.local

# Edit .env.local with your keys



# 3. Set up Supabase

npx supabase init

npx supabase db push



# 4. Start backend (Sahara proxy)

cd backend

python -m venv .venv

source .venv/bin/activate  # Windows: .venv\Scripts\activate

pip install -r requirements.txt

uvicorn main:app --reload



# 5. Start frontend (in another terminal)

cd ..

npm run dev



# 6. Open http://localhost:3000

```



### Key Scripts



```json

{

  "scripts": {

    "dev": "next dev",

    "build": "next build",

    "start": "next start",

    "lint": "next lint",

    "type-check": "tsc --noEmit",

    "test": "vitest",

    "test:e2e": "playwright test",

    "db:migrate": "supabase db push",

    "db:reset": "supabase db reset",

    "db:seed": "supabase db seed",

    "format": "prettier --write ."

  }

}

```



### Testing Strategy



```bash

# Unit tests (CME, Gs gate, entity extractor)

npm test -- --run src/lib/meaning-engine/



# Integration tests (voice flow, approval flow)

npm test -- --run tests/integration/



# E2E tests (demo flow for judges)

npm run test:e2e



# Type checking

npm run type-check



# Linting

npm run lint

```



---



## 📌 QUICK REFERENCE FOR AI CODING ASSISTANTS



When developing PAL, always follow these rules:



1. **Every voice action goes through the CME first** — never bypass the Cultural Meaning Engine

2. **All database tables have workspace_id** — enforce tenant isolation

3. **Gs gate runs before any action** — no action executes without risk assessment

4. **Ask mode is read-only** — bypasses Gs gate

5. **Learn mode is unblockable** — memory writes always succeed

6. **Do mode is gated** — requires approval for Gs ≥ 3.0

7. **Use Zod for all validation** — runtime type safety

8. **Entity IDs are UUIDs** — use `uuid_generate_v4()`

9. **Embeddings are 768-dim** — multilingual-e5-base

10. **Quiet hours are 21:00-08:00 WAT** — enforce in all scheduled jobs



---



**This document is the single source of truth for PAL development.**



Share this with Qwen Code or any AI assistant to generate implementation code that follows the exact architecture, patterns, and conventions defined here.Web search 
