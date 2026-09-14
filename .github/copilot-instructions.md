# GitHub Copilot Instructions for PAL

You are building PAL — a voice-first AI OS for African commerce.

## Stack
- React 18, TypeScript 5.5, Vite 5
- Supabase PostgreSQL + pgvector (768-dim)
- Tailwind CSS + shadcn/ui
- Zustand (global UI) + TanStack Query (server state)
- Zod for validation

## Design Tokens
- Ivory: #FAF7F2 (background)
- Charcoal: #16151A (primary surfaces)
- Violet: #6C3DF4 (PAL reasoning/intelligence)
- Teal: #2E8B8B (understood/validated)
- Amber: #D97706 (uncertainty/clarification)
- Red: #DC2626 (blocked/rejected)
- Font: DM Sans

## Critical Rules
1. TypeScript strict mode — no `any` types
2. Zod for ALL validation
3. Supabase RLS on every table with FORCE ROW LEVEL SECURITY
4. Gs gate before every DO action
5. CME before every AI reasoning step
6. 768-dim embeddings (multilingual-e5-base)
7. Quiet hours: 21:00-08:00 WAT
8. All tables have workspace_id for tenant isolation
9. Composite foreign keys: UNIQUE(workspace_id, id)
10. JSDoc on all public APIs

## Three Modes
- ASK 🔍 → Read from memory (cited answers, bypasses Gs)
- LEARN 🧠 → Write to memory (unblockable)
- DO ⚡ → Execute actions (GATED by Gs score + approval)

## File Structure
- src/lib/meaning-engine/ — CME, Gs Gate, Entity Extractor
- src/lib/memory/ — Vector store, embeddings
- src/lib/executor/ — Workflow compiler, job scheduler
- src/stores/ — Zustand stores
- src/types/ — TypeScript definitions
