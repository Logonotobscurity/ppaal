# PAL API Contracts

WebSocket and REST API specifications for PAL voice streaming and meaning processing.

---

## 6.1 WebSocket Protocol (Voice Streaming)

**Endpoint:** `wss://your-backend/ws/transcribe`

### Client → Server Messages

```typescript
// Audio chunk (binary)
type AudioChunk = Blob; // webm/opus, 250ms chunks

// Control message
interface ControlMessage {
  type: "end_of_stream";
}
```

### Server → Client Messages

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

### Example Flow

```
Client                              Server
  │                                   │
  ├───── AudioChunk (webm/opus) ─────►│
  │                                   │
  ◄─────────── AckMessage ────────────┤
  │                                   │
  ├───── AudioChunk ─────────────────►│
  │                                   │
  ◄────── PartialTranscript ──────────┤
  │         "Ngozi still dey..."      │
  │                                   │
  ├───── AudioChunk ─────────────────►│
  │                                   │
  ◄──────── FinalTranscript ──────────┤
  │   text: "Ngozi still dey owe me"  │
  │   lang: "pcm"                     │
  │   codeswitch: true                │
  │                                   │
  ├───── end_of_stream ──────────────►│
  │                                   │
```

---

## 6.2 REST API Endpoints

### Meaning Engine

#### POST /api/interpret

Transforms transcript into structured entities with constraints and Gs score.

**Request:**
```typescript
interface InterpretRequest {
  transcript: string;
  language_spans: LanguageSpan[];
  workspace_id: string;
  mode: "ask" | "learn" | "do";
}

interface LanguageSpan {
  text: string;
  lang: "en" | "pcm" | "yor" | "ibo" | "hau";
  confidence: number;
  start_ms: number;
  end_ms: number;
}
```

**Response:**
```typescript
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

**Example:**
```bash
curl -X POST https://api.pal.app/api/interpret \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "transcript": "Ngozi still dey owe me eighty-five thousand. Remind Musa about invoice, but no send am today.",
    "language_spans": [
      {"text": "Ngozi still dey owe me", "lang": "pcm", "confidence": 0.95, "start_ms": 0, "end_ms": 1800},
      {"text": "eighty-five thousand", "lang": "en", "confidence": 0.92, "start_ms": 1800, "end_ms": 2500}
    ],
    "workspace_id": "uuid-here",
    "mode": "do"
  }'
```

---

### Semantic Memory

#### POST /api/memory/search

Semantic search with citations using pgvector HNSW index.

**Request:**
```typescript
interface MemorySearchRequest {
  query: string;
  workspace_id: string;
  k?: number; // default 7
  tags?: string[];
}
```

**Response:**
```typescript
interface MemorySearchResponse {
  results: Array<{
    id: string;
    content: string;
    score: number;
    tags: string[];
    citation_key: string;
  }>;
}
```

**Example:**
```bash
curl -X POST https://api.pal.app/api/memory/search \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "query": "What did Ngozi promise about payment?",
    "workspace_id": "uuid-here",
    "k": 7
  }'
```

#### POST /api/memory/store

Store new memory with auto-tagging.

**Request:**
```typescript
interface MemoryStoreRequest {
  content: string;
  workspace_id: string;
  tags?: string[];
  source_session_id?: string;
}
```

**Response:**
```typescript
interface MemoryStoreResponse {
  id: string;
  citation_key: string;
  embedding_id: string;
}
```

---

### Approvals

#### GET /api/approvals

List pending approvals requiring human decision.

**Response:**
```typescript
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
```

#### POST /api/approvals/:id/resolve

Resolve an approval with verdict.

**Request:**
```typescript
interface ResolveApprovalRequest {
  verdict: "approve" | "reject" | "revise";
  revision?: {
    field: string;
    new_value: any;
  };
}
```

**Response:**
```typescript
interface ResolveApprovalResponse {
  id: string;
  status: "approved" | "rejected" | "revised";
  executed_at: string | null;
}
```

---

### Workflows

#### GET /api/workflows

List workflows for workspace.

**Response:**
```typescript
interface WorkflowListResponse {
  workflows: Array<{
    id: string;
    name: string;
    trigger_type: "manual" | "cron" | "webhook" | "voice";
    is_active: boolean;
    last_run_at: string | null;
  }>;
}
```

#### POST /api/workflows/:id/run

Manually trigger a workflow.

**Response:**
```typescript
interface WorkflowRunResponse {
  run_id: string;
  status: "pending" | "running";
  estimated_duration_ms: number;
}
```

---

### Collections

#### GET /api/collections/promises

List collection promises with status.

**Response:**
```typescript
interface CollectionPromisesResponse {
  promises: Array<{
    id: string;
    customer_id: string;
    customer_name: string;
    amount: number;
    currency: string;
    due_date: string;
    status: "pending" | "promised" | "settled" | "overdue" | "disputed";
    days_overdue?: number;
  }>;
}
```

#### POST /api/collections/:id/remind

Send payment reminder via configured channel.

**Request:**
```typescript
interface SendReminderRequest {
  channel: "whatsapp" | "sms" | "email";
  template?: string; // Custom message template
}
```

---

## Error Handling

### Standard Error Response

```typescript
interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  request_id: string; // For debugging
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Invalid or missing auth token |
| `FORBIDDEN` | 403 | User lacks permission for resource |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Request body failed Zod validation |
| `GS_BLOCKED` | 403 | Action blocked by Safeguard Gate (Gs ≥ 7.0) |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/api/interpret` | 60 req/min | Sliding window |
| `/api/memory/search` | 100 req/min | Sliding window |
| `/api/memory/store` | 30 req/min | Sliding window |
| `/api/approvals/*` | 120 req/min | Sliding window |
| WebSocket | 1 concurrent session | Per user |

---

## Authentication

All REST endpoints require Bearer token in Authorization header:

```
Authorization: Bearer <supabase_jwt_token>
```

WebSocket connections authenticate via query parameter:

```
wss://api.pal.app/ws/transcribe?token=<supabase_jwt_token>
```

Tokens are issued by Supabase Auth and expire after 1 hour.
