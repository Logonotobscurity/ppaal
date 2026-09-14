# PAL Architecture Specification

## System Overview

PAL is a voice-first AI operating system for African commerce that transforms code-switched speech (English, Pidgin, Yorùbá, Igbo, Hausa) into structured business state, governed agentic workflows, and founder wellness intelligence.

**Core Thesis:** Better speech recognition only matters if the meaning survives into the downstream decision.

**Pipeline:** `SPEECH → MEANING → STATE → WORKFLOW → DECISION → ACTION`

---

## 6-Layer Architecture

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

## Data Flow

### Voice Session Flow

1. **User speaks** → Web Audio API captures 250ms chunks (webm/opus)
2. **WebSocket stream** → Backend proxies to Sahara CodeSwitch API
3. **Partial transcripts** → Real-time display in Command Orb
4. **Final transcript** → Sent to Meaning Engine
5. **CME processing** → Negation detection, idiom grounding, constraint extraction
6. **Entity extraction** → LLM-based extraction with CME enrichment
7. **Gs Gate calculation** → Risk scoring and gate outcome determination
8. **Mode inference** → ASK (read), LEARN (write), DO (execute)
9. **Workflow compilation** → Intent → DSL → pg-boss jobs
10. **Approval gate** → Human review if Gs ≥ 3.0
11. **Execution** → Channel dispatch (WhatsApp/SMS/Email)

### Memory Flow

1. **Query embedding** → multilingual-e5-base (768-dim)
2. **HNSW search** → k=7 nearest neighbors (cosine similarity)
3. **Auto-tagging** → #PriceSignal, #CustomerChurnRisk, etc.
4. **Citation policy** → "Cited-or-Silent" — never fabricate
5. **Mesh storage** → Content + embedding + tags + citation_key

---

## Three Modes

| Mode | Symbol | Purpose | Gs Gate | Example |
|------|--------|---------|---------|---------|
| **ASK** | 🔍 | Read from memory | Bypassed | "What did Ngozi promise?" |
| **LEARN** | 🧠 | Write to memory | Bypassed | "Save this customer info" |
| **DO** | ⚡ | Execute actions | Gated (≥3.0 requires approval) | "Send payment reminder" |

---

## Critical Invariants

1. Every voice action goes through CME FIRST — never bypass
2. All database tables have workspace_id — enforce tenant isolation
3. Gs gate runs before ANY action — no action executes without risk assessment
4. ASK mode is read-only — bypasses Gs gate
5. LEARN mode is unblockable — memory writes always succeed
6. DO mode is gated — requires approval for Gs ≥ 3.0
7. Use Zod for ALL validation — runtime type safety
8. Entity IDs are UUIDs — use `uuid_generate_v4()`
9. Embeddings are 768-dim — multilingual-e5-base
10. Quiet hours: 21:00-08:00 WAT — enforce in ALL scheduled jobs
11. RLS + FORCE ROW LEVEL SECURITY on every table
12. Composite tenant foreign keys: `UNIQUE(workspace_id, id)`
13. HNSW indexes: `vector_cosine_ops, m=16, ef=64`
14. "Cited-or-Silent" RAG policy — never fabricate business data
15. `gs_breakdown` JSONB persisted on EVERY workflow run

---

## Technology Stack

See `../package.json` for frontend dependencies and `backend/requirements.txt` for backend.

**Key versions:**
- React 18.3.1 + TypeScript 5.5.4 + Vite 5.4.0
- TanStack Query 5.51.21 + Zustand 4.5.4
- Tailwind CSS 3.4.9 + shadcn/ui
- Supabase PostgreSQL 15+ + pgvector 0.7.0
- pg-boss 9.0.0
- Zod 3.23.8

---

## Reference Documents

- `DATABASE_SCHEMA.md` — Complete SQL for all tables
- `API_CONTRACTS.md` — WebSocket + REST message schemas
- `ALGORITHMS.md` — CME, Gs Gate, Entity Extractor implementation
- `DESIGN_TOKENS.md` — Colors, typography, spacing, animations
- `COMPONENT_SPECS.md` — Screen-by-screen component trees
