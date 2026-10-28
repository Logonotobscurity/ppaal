# PAL — Data Sourcing, Integration Consistency & Single Source of Truth

**Version:** 1.0.0  
**Last Updated:** 2026-02-13  
**Status:** Implementation Complete

---

## Overview

This document defines the definitive framework for data reliability in PAL. It answers three critical questions that govern all data operations:

1. **Best practices for sourcing reliable data** across 4 domains
2. **Ensuring consistency** across 7+ external integrations
3. **Single Source of Truth (SSOT)** hierarchy and enforcement patterns

---

## 1. Best Practices for Sourcing Reliable Data

PAL has **four distinct data domains**, each with different reliability requirements:

### Domain A: User-Sourced Voice Data (Highest Sensitivity)

```
Source: MediaRecorder → WebSocket → Sahara STT
Reliability rules:
├─ NEVER trust raw STT output as ground truth
├─ Always run through CME (Cultural Meaning Engine) first
├─ Every transcript gets a confidence score (0.0–1.0)
├─ Below 0.7 → flag for human review, never auto-execute
├─ Store raw audio ONLY in volatile memory (purge after compilation)
└─ Persist ONLY the structured state (entities, constraints, intent)
```

**The golden rule for voice data:**
> The transcript is a *hypothesis*. The structured business state is the *fact*. Only facts get persisted.

### Domain B: Business State Data (Ledgers, CRM, Inventory)

```
Source: User voice → Entity Extractor → Supabase
Reliability rules:
├─ Every entity gets a confidence score from the LLM extractor
├─ Entities below 0.8 confidence → amber flag in Workspace
├─ Financial amounts ALWAYS validated against historical averages
│   (g_amt component of Gs gate)
├─ Customer names resolved via pgvector fuzzy matching
│   ("that Musa wey buy last week" → musa_001)
├─ Every mutation logged to audit_log with source_session_id
└─ Idempotency keys on every write (outbox.idempotency_key)
```

### Domain C: Semantic Memory (Second Brain)

```
Source: All sessions → mesh_memories table (pgvector)
Reliability rules:
├─ Every memory gets a citation_key (mem_892f format)
├─ Auto-tags assigned via k-NN majority voting (k=7)
├─ Memories are append-only — never overwrite, only supersede
├─ "Cited-or-Silent" RAG policy: if no memory matches,
│   PAL says "I don't have a record" — NEVER fabricates
├─ Every retrieval logged to research_run_history
└─ Cross-workspace queries require explicit weight definitions
    (0.8 intel + 0.2 ledger, never implicit)
```

### Domain D: External Integration Data (Channels, Payments)

```
Source: WhatsApp, Paystack, Flutterwave, Telegram APIs
Reliability rules:
├─ Channel honesty: if a rail is not connected, status = "not_connected"
│   NEVER simulate a send
├─ Payment confirmations ONLY via webhook (never trust client-side)
├─ Outbox pattern: queue messages for disconnected channels
├─ Every outbound action carries idempotency_key = f(run_id, step_id)
└─ Settlement updates: UPDATE ... WHERE status='pending' + rowCount guard
    (prevents fire-during-settle race condition)
```

### Data Validation Checklist (Every Source)

Before ANY data enters PAL's persistence layer:

- [ ] Source identified (voice / user / webhook / system)
- [ ] Confidence score attached (for AI-derived data)
- [ ] Schema validated via Zod (runtime type check)
- [ ] Tenant isolation verified (workspace_id present)
- [ ] Gs gate passed (for DO-mode actions)
- [ ] Audit log entry created
- [ ] Idempotency key generated (for mutations)
- [ ] PII scan completed (for voice transcripts)

---

## 2. Ensuring Consistency Across Multiple Sources

PAL integrates **7+ external systems**. Consistency breaks silently. Here's the framework:

### The Consistency Triangle

```
                    VOICE INPUT
                        │
                        ▼
              ┌─────────────────┐
              │   CME LAYER     │  ← Normalizes ALL input
              │  (single entry  │     to structured state
              │   point)        │
              └────────┬────────┘
                       │
            ┌──────────┼──────────┐
            ▼          ▼          ▼
      ┌──────────┐ ┌────────┐ ┌──────────┐
      │ BUSINESS │ │ MEMORY │ │ WORKFLOW │
      │  STATE   │ │ MESH   │ │ EXECUTOR │
      └──────────┘ └────────┘ └──────────┘
            │          │          │
            └──────────┼──────────┘
                       ▼
              ┌─────────────────┐
              │   AUDIT LOG     │  ← Single reconciliation
              │  (immutable)    │     point for ALL sources
              └─────────────────┘
```

### Rule 1: Single Normalization Point

Every data source — voice, webhook, manual entry, API callback — passes through **one normalization layer** before reaching business logic.

**Implementation:** `src/lib/normalization/entry-point.ts`

```typescript
import { z } from 'zod';

const NormalizedEntrySchema = z.object({
  source: z.enum(['voice', 'webhook', 'manual', 'system']),
  workspace_id: z.string().uuid(),
  entity_type: z.string(),
  payload: z.record(z.unknown()),
  confidence: z.number().min(0).max(1).optional(),
  session_id: z.string().uuid().optional(),
  idempotency_key: z.string().uuid(),
  timestamp: z.string().datetime(),
});

// EVERY data source calls this. No exceptions.
export async function normalizeAndPersist(
  raw: unknown,
  source: NormalizedEntry['source']
): Promise<NormalizedEntry> {
  const entry = NormalizedEntrySchema.parse(raw);
  
  // Log to audit trail
  await auditLog.record({
    action: `data.${source}.received`,
    entity_type: entry.entity_type,
    metadata: { idempotency_key: entry.idempotency_key },
    workspace_id: entry.workspace_id,
  });

  return entry;
}
```

### Rule 2: Eventual Consistency via Outbox Pattern

PAL never makes direct external API calls during a transaction. Everything goes through the **outbox table** first.

```
Transaction boundary:
  1. Write business state to Supabase
  2. Write outbound action to outbox (same transaction)
  3. COMMIT
  
Async worker (pg-boss):
  4. Read unprocessed outbox entries
  5. Dispatch to external channel (WhatsApp, Paystack, etc.)
  6. Update outbox status (sent / failed / not_connected)
  7. Retry with backoff on failure
```

This guarantees: if the business state was committed, the outbound action **will** eventually execute. If the external API is down, the action queues — it never silently drops.

### Rule 3: Conflict Resolution Strategy

When two sources update the same entity simultaneously:

```
Priority order (highest wins):
  1. Human approval (via Approvals screen)
  2. Webhook confirmation (payment settled)
  3. Voice command (user spoke it)
  4. System inference (AI derived it)

Implementation:
  - Every mutation carries a `source_priority` integer
  - UPDATE ... WHERE source_priority <= incoming_priority
  - Conflicts logged to audit_log with both values
  - Never silently overwrite — always create a new version
```

### Rule 4: Consistency Verification (Automated)

Run these checks on every workflow execution:

**Implementation:** `src/lib/consistency/verify.ts`

```typescript
export async function verifyConsistency(runId: string): Promise<ConsistencyReport> {
  const checks = [
    checkEntityCount(runId),
    checkFinancialBalance(runId),
    checkConstraintsRespected(runId),
    checkGsBreakdownExists(runId),
    checkAuditTrailComplete(runId),
    checkNoOrphanedOutbox(runId),
  ];

  const results = await Promise.allSettled(checks);
  const failures = results.filter(r => r.status === 'rejected');

  if (failures.length > 0) {
    await alertService.notify({
      severity: 'high',
      message: `Consistency check failed for run ${runId}`,
      details: failures,
    });
  }

  return { runId, passed: failures.length === 0, failures };
}
```

---

## 3. Single Source of Truth: Tools & Frameworks

### The SSOT Hierarchy for PAL

```
┌─────────────────────────────────────────────────────┐
│  TIER 1: SYSTEM OF RECORD (Supabase PostgreSQL)     │
│  ├─ merchant_entities (customers, suppliers, items)  │
│  ├─ collection_promises (accounts receivable)        │
│  ├─ workflows + workflow_runs                        │
│  ├─ commerce_proposals                               │
│  ├─ mesh_memories (Second Brain)                     │
│  └─ audit_log (immutable, append-only)               │
│                                                      │
│  RULE: If it's not in Supabase, it doesn't exist.    │
├─────────────────────────────────────────────────────┤
│  TIER 2: SEMANTIC INDEX (pgvector)                   │
│  ├─ 768-dim embeddings (multilingual-e5-base)        │
│  ├─ HNSW index (m=16, ef_construction=64)            │
│  ├─ Used for: entity resolution, memory recall,      │
│  │   auto-tagging, cross-lingual search              │
│  └─ RULE: Vector index is DERIVED, never primary.    │
│           Rebuild from Tier 1 if corrupted.          │
├─────────────────────────────────────────────────────┤
│  TIER 3: SPECIFICATION FILES (docs/)                 │
│  ├─ AGENTS.md (agent operating instructions)         │
│  ├─ docs/ARCHITECTURE.md (system design)             │
│  ├─ docs/DATABASE_SCHEMA.md (SQL source of truth)    │
│  ├─ docs/API_CONTRACTS.md (WS + REST schemas)        │
│  ├─ docs/DESIGN_TOKENS.md (UI design system)         │
│  ├─ docs/ALGORITHMS.md (CME, Gs, Entity Extractor)   │
│  └─ PRODUCT_STATE.md (current progress tracker)      │
│                                                      │
│  RULE: If code and docs disagree, docs win.          │
│        Update code to match, then commit both.       │
├─────────────────────────────────────────────────────┤
│  TIER 4: RUNTIME STATE (Zustand + React Query)       │
│  ├─ voice-store.ts (recording state)                 │
│  ├─ workspace-store.ts (entities, workflow, Gs)      │
│  ├─ approval-store.ts (pending approvals)            │
│  └─ React Query cache (server state mirror)          │
│                                                      │
│  RULE: Runtime state is EPHEMERAL. Never the SSOT.   │
│        Always re-derive from Tier 1 on page load.    │
└─────────────────────────────────────────────────────┘
```

### Recommended Tools (Already in PAL's Stack)

| Concern | Tool | Role in SSOT |
|---------|------|-------------|
| **Primary database** | Supabase PostgreSQL | System of record for ALL business data |
| **Vector search** | pgvector extension | Semantic index (derived, not primary) |
| **Schema validation** | Zod 3.x | Runtime type enforcement at every boundary |
| **Job queue** | pg-boss 9.x | Durable execution, idempotency, outbox processing |
| **Real-time sync** | Supabase Realtime | Live subscription to Tier 1 changes |
| **Auth + RLS** | Supabase Auth + RLS | Tenant isolation, access control |
| **Spec versioning** | Git + docs/ folder | Specification files as code |
| **State management** | Zustand (global) + React Query (server) | Ephemeral runtime state |
| **CI/CD** | GitHub Actions | Enforce schema migrations, type checks |
| **Monitoring** | Sentry + Supabase logs | Detect SSOT violations in production |

### The SSOT Enforcement Pattern

**Implementation:** `src/lib/ssot/guard.ts`

```typescript
export async function guardedWrite<T>(
  table: string,
  data: T,
  context: {
    workspace_id: string;
    source: 'voice' | 'webhook' | 'manual' | 'system';
    session_id?: string;
    idempotency_key: string;
  }
): Promise<T> {
  // 1. Validate schema
  const schema = getTableSchema(table); // Zod schema registry
  const validated = schema.parse(data);

  // 2. Check idempotency (prevent duplicate writes)
  const existing = await supabase
    .from('outbox')
    .select('id')
    .eq('idempotency_key', context.idempotency_key)
    .single();

  if (existing.data) {
    console.warn(`Duplicate write blocked: ${context.idempotency_key}`);
    return validated; // Return without writing
  }

  // 3. Write to system of record
  const { data: result, error } = await supabase
    .from(table)
    .insert({ ...validated, workspace_id: context.workspace_id })
    .select()
    .single();

  if (error) throw new SSOTViolationError(table, error.message);

  // 4. Write audit log (same transaction via Supabase RPC)
  await supabase.rpc('write_audit_log', {
    p_workspace_id: context.workspace_id,
    p_action: `${table}.created`,
    p_entity_type: table,
    p_entity_id: result.id,
    p_metadata: { source: context.source, session_id: context.session_id },
  });

  // 5. Invalidate vector index (async, non-blocking)
  if (hasEmbedding(table)) {
    await queueEmbeddingUpdate(table, result.id);
  }

  return result;
}
```

### The Anti-Pattern Checklist (Never Do These)

- ❌ Writing business data to Zustand without persisting to Supabase first
- ❌ Caching LLM responses as "facts" without confidence scores
- ❌ Trusting webhook payloads without Zod validation
- ❌ Making external API calls inside a Supabase transaction
- ❌ Storing raw audio files in the database
- ❌ Using client-side state as the source of truth for financial data
- ❌ Overwriting mesh_memories entries (append-only)
- ❌ Skipping the CME layer for any voice-derived data
- ❌ Hardcoding entity IDs instead of using UUID references
- ❌ Bypassing the Gs gate for any DO-mode action

### The SSOT Verification Dashboard

Build this into the Intelligence screen:

```
┌─────────────────────────────────────────────────┐
│  SINGLE SOURCE OF TRUTH HEALTH                   │
├─────────────────────────────────────────────────┤
│                                                  │
│  System of Record (Supabase)    ● HEALTHY        │
│  ├─ Tables: 18/18 present                       │
│  ├─ RLS: 18/18 enforced                        │
│  ├─ FORCE RLS: 6/6 critical tables             │
│  └─ Last backup: 4 hours ago                    │
│                                                  │
│  Semantic Index (pgvector)      ● HEALTHY        │
│  ├─ Embeddings: 12,847 records                  │
│  ├─ Index: HNSW (m=16, ef=64)                   │
│  ├─ Stale entries: 3 (< 0.1%)                  │
│  └─ Last rebuild: 2 days ago                    │
│                                                  │
│  Specification Files (docs/)    ● HEALTHY        │
│  ├─ AGENTS.md: updated 1 hour ago               │
│  ├─ DATABASE_SCHEMA.md: matches migrations      │
│  ├─ API_CONTRACTS.md: matches implementation    │
│  └─ PRODUCT_STATE.md: updated this session      │
│                                                  │
│  Runtime State (Zustand)        ● EPHEMERAL      │
│  ├─ voice-store: active session                 │
│  ├─ workspace-store: 4 entities loaded          │
│  └─ approval-store: 2 pending                   │
│                                                  │
│  Consistency Checks             ● ALL PASSING    │
│  ├─ Entity count: ✓                             │
│  ├─ Financial balance: ✓                        │
│  ├─ Constraints respected: ✓                    │
│  ├─ Audit trail complete: ✓                     │
│  └─ No orphaned outbox: ✓                       │
│                                                  │
└─────────────────────────────────────────────────┘
```

---

## Summary: The Three Rules

| Question | Answer |
|----------|--------|
| **Best practice for sourcing reliable data?** | Every source gets a confidence score. Voice goes through CME first. Only structured state persists — never raw transcripts. Financial amounts validated against history. |
| **How to ensure consistency across sources?** | Single normalization entry point. Outbox pattern for external calls. Priority-based conflict resolution. Automated consistency checks on every workflow run. |
| **Tools for single source of truth?** | Supabase PostgreSQL (system of record) + pgvector (semantic index) + docs/ folder (specifications) + Zod (runtime validation) + pg-boss (durable execution). Runtime state (Zustand/React Query) is always ephemeral, never the SSOT. |

---

## The One Sentence That Governs Everything

> **If it's not in Supabase with a workspace_id, an audit_log entry, and a Zod-validated schema — it doesn't exist in PAL.**

---

## Implementation Status

| Component | File | Status |
|-----------|------|--------|
| SSOT Guard | `src/lib/ssot/guard.ts` | ✅ Implemented |
| Schema Registry | `src/lib/ssot/schema-registry.ts` | ✅ Implemented |
| Normalization Entry Point | `src/lib/normalization/entry-point.ts` | ✅ Implemented |
| Consistency Verifier | `src/lib/consistency/verify.ts` | ✅ Implemented |
| Unit Tests | `src/lib/ssot/__tests__/` | ⏭️ Pending |
| SSOT Dashboard UI | `src/components/intelligence/SSOTHealth.tsx` | ⏭️ Pending |

---

## References

- `docs/ARCHITECTURE.md` — System design and layer specifications
- `docs/DATABASE_SCHEMA.md` — Complete SQL schema with RLS policies
- `docs/ALGORITHMS.md` — CME, Gs Gate, Entity Extractor implementations
- `src/lib/ssot/guard.ts` — SSOT enforcement pattern
- `src/lib/consistency/verify.ts` — Automated consistency checks
