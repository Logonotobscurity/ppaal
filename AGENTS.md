# PAL — Agent Operating Instructions

## What You Are Building
PAL is a voice-first AI operating system for African commerce. It transforms
code-switched speech (English, Pidgin, Yorùbá, Igbo, Hausa) into structured
business state, governed agentic workflows, and founder wellness intelligence.

Core thesis: Better speech recognition only matters if the meaning survives
into the downstream decision.

## Architecture (6 Layers)
0. Cultural Meaning Engine (CME) — Sahara STT, negation parsing, idiom grounding
1. Asher Compiler + Mesh Memory — pgvector semantic recall, workflow compilation
2. Safeguard Gate (Gs) — Risk scoring: 1.5·g_neg + 1.2·g_amt + 1.0·g_ch + 1.0·g_drift + 1.1·g_health
3. Durable Executor — pg-boss jobs, collections ladder, quiet hours, idempotency
4. Postgres Spine — Supabase + pgvector + RLS + FORCE RLS + composite tenant FKs
5. User Surface — Command, Workspace, Approvals, Intelligence, Activity

## Technology Stack (Do Not Change)
- Frontend: React 18 + TypeScript 5.5 + Vite 5
- State: TanStack Query (server) + Zustand (global UI)
- UI: Tailwind CSS + shadcn/ui (Radix primitives)
- Database: Supabase PostgreSQL + pgvector (768-dim, multilingual-e5-base)
- Voice: Sahara CodeSwitch Streaming API (WebSocket)
- LLM: Claude 3.5 Sonnet (primary) + Gemini 1.5 Flash (fallback) + Ollama (local)
- Jobs: pg-boss 9.x
- Validation: Zod 3.x
- Hosting: Vercel + Supabase

## Design Tokens (Strict — No Deviation)
- Ivory: #FAF7F2 (background)
- Charcoal: #16151A (primary surfaces)
- Violet: #6C3DF4 (PAL reasoning / intelligence)
- Teal: #2E8B8B (understood / validated)
- Amber: #D97706 (uncertainty / clarification)
- Red: #DC2626 (blocked / rejected)
- Font UI: DM Sans | Font Editorial: Cormorant Garamond (landing only)
- Radius: 16-24px cards, thin borders, large whitespace
- FORBIDDEN: Gradients everywhere, AI-robot imagery, dominant chat bubbles

## Three Modes (Ask / Learn / Do)
- ASK 🔍 → Read from memory (cited answers, bypasses Gs)
- LEARN 🧠 → Write to memory (unblockable, bypasses Gs)
- DO ⚡ → Execute actions (GATED by Gs score + approval)

## Critical Rules (Never Violate)
1. Every voice action goes through CME FIRST — never bypass
2. All database tables have workspace_id — enforce tenant isolation
3. Gs gate runs before ANY action — no action executes without risk assessment
4. ASK mode is read-only — bypasses Gs gate
5. LEARN mode is unblockable — memory writes always succeed
6. DO mode is gated — requires approval for Gs ≥ 3.0
7. Use Zod for ALL validation — runtime type safety
8. Entity IDs are UUIDs — use uuid_generate_v4()
9. Embeddings are 768-dim — multilingual-e5-base
10. Quiet hours: 21:00-08:00 WAT — enforce in ALL scheduled jobs
11. RLS + FORCE ROW LEVEL SECURITY on every table
12. Composite tenant foreign keys: UNIQUE(workspace_id, id)
13. HNSW indexes: vector_cosine_ops, m=16, ef=64
14. "Cited-or-Silent" RAG policy — never fabricate business data
15. gs_breakdown JSONB persisted on EVERY workflow run

## File Organization
Follow feature-based structure:
src/features/[feature]/pages/ + components/ + hooks/ + services/
src/components/ui/ — shadcn/ui only
src/lib/meaning-engine/ — CME, negation-parser, gs-gate, entity-extractor
src/lib/memory/ — vector-store, embeddings, auto-tagger
src/lib/executor/ — workflow-compiler, job-scheduler, channel-dispatch
src/stores/ — voice-store.ts, workspace-store.ts, approval-store.ts
src/types/ — api.ts, voice.ts, meaning.ts, workflow.ts, database.ts

## Code Style
- TypeScript strict mode — no `any` types
- Functional components only — no class components
- Custom hooks prefix: use- (e.g., use-sahara.ts)
- Services suffix: Service (e.g., dashboardService.ts)
- JSDoc comments on ALL public APIs
- Named exports preferred over default exports
- Error handling: try/catch with typed errors, never silent failures

## Reference Documents
When you need details beyond this file, refer to:
- docs/ARCHITECTURE.md — Full system diagram and layer specs
- docs/DATABASE_SCHEMA.md — Complete SQL for all tables
- docs/API_CONTRACTS.md — WebSocket + REST message schemas
- docs/ALGORITHMS.md — CME, Gs Gate, Entity Extractor code
- docs/DESIGN_TOKENS.md — Complete design system
- docs/COMPONENT_SPECS.md — Screen-by-screen component trees
