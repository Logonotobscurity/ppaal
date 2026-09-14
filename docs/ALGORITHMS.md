# PAL Core Algorithms

Implementation specifications for CME, Gs Gate, and Entity Extractor.

---

## 8.1 Cultural Meaning Engine (CME)

**File:** `src/lib/meaning-engine/cme.ts`

### Purpose

The Cultural Meaning Engine processes code-switched African speech to detect:
- Verbatim negations (hard blocks)
- Fuzzy negations (soft warnings)
- Idioms and their grounded meanings
- Temporal and conditional constraints

### Types

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
```

### Verbatim Negation Lexicon

```typescript
// Hard block patterns - these ALWAYS create hard_block constraints
const VERBATIM_NEGATIONS = [
  { pattern: /no send am/i, lang: 'pcm', meaning: 'do_not_send' },
  { pattern: /ma se/i, lang: 'yor', meaning: 'do_not_do' },
  { pattern: /don't send/i, lang: 'en', meaning: 'do_not_send' },
  { pattern: /no do am/i, lang: 'pcm', meaning: 'do_not_execute' },
  { pattern: /never/i, lang: 'en', meaning: 'never_execute' },
  { pattern: /a ba se/i, lang: 'yor', meaning: 'do_not_do' },
  { pattern: /akarabịa/i, lang: 'ibo', meaning: 'do_not_come' },
  { pattern: /kadau/i, lang: 'hau', meaning: 'stop_now' },
];
```

### Idiom Grounding Table

```typescript
// Idioms mapped to business semantics
const IDIOM_MAP = [
  { pattern: /small small/i, lang: 'pcm', grounded: 'batch_mode', type: 'execution_modifier' },
  { pattern: /abeg hold am/i, lang: 'pcm', grounded: 'status_paused', type: 'status_modifier' },
  { pattern: /e go pay/i, lang: 'pcm', grounded: 'payment_commitment', type: 'commitment' },
  { pattern: /shenk am/i, lang: 'pcm', grounded: 'approve', type: 'approval' },
  { pattern: /jare/i, lang: 'yor', grounded: 'go_ahead', type: 'approval' },
  { pattern: /ngwa ngwa/i, lang: 'ibo', grounded: 'urgent', type: 'priority' },
  { pattern: /sannu a hankali/i, lang: 'hau', grounded: 'gentle_approach', type: 'tone' },
];
```

### Implementation

```typescript
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

    // 2. Fuzzy negation detection (lower confidence, soft warnings)
    const fuzzyPatterns = [
      { pattern: /wait|hold on|later/i, meaning: 'delay_execution' },
      { pattern: /maybe|perhaps|I think/i, meaning: 'uncertain' },
      { pattern: /fit|might|could/i, meaning: 'possibility' },
    ];

    for (const pattern of fuzzyPatterns) {
      if (pattern.pattern.test(transcript)) {
        fuzzy_negations.push({
          phrase: transcript.match(pattern.pattern)?.[0] || '',
          span: language_spans[0], // Simplified - would find actual span
          confidence: 0.6,
        });

        constraints.push({
          type: 'negation',
          condition: pattern.meaning,
          severity: 'soft_warning',
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

---

## 8.2 Safeguard Gate (Gs)

**File:** `src/lib/meaning-engine/gs-gate.ts`

### Purpose

The Safeguard Gate calculates a risk score for every DO-mode action to determine if human approval is required.

### Formula

```
Gs = 1.5·g_neg + 1.2·g_amt + 1.0·g_ch + 1.0·g_drift + 1.1·g_health
```

### Weights

```typescript
const WEIGHTS = {
  neg: 1.5,    // Negation multiplier
  amt: 1.2,    // Amount deviation multiplier
  ch: 1.0,     // Channel disconnected penalty
  drift: 1.0,  // Transcript drift multiplier
  health: 1.1, // Founder wellness multiplier
} as const;
```

### Thresholds

```typescript
const THRESHOLDS = {
  auto_stage: 3.0,   // Below: auto-stage workflow
  verbal_confirm: 5.0, // ≥5.0: require verbal confirmation
  blocked: 7.0,      // ≥7.0: action blocked entirely
} as const;
```

### Types

```typescript
export interface GsBreakdown {
  g_neg: number;
  g_amt: number;
  g_ch: number;
  g_drift: number;
  g_health: number;
  weights: typeof WEIGHTS;
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
```

### Implementation

```typescript
export class SafeguardGate {
  calculate(input: GsGateInput): GsGateResult {
    // Calculate individual components
    const g_neg = input.negation_count * 0.5; // Each negation adds 0.5
    const g_amt = Math.min(input.amount_deviation / 10, 2); // Cap at 2
    const g_ch = input.channel_connected ? 0 : 1; // +1 if channel disconnected
    const g_drift = input.transcript_drift; // Already 0-1
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

### Example Calculation

```typescript
const gs = new SafeguardGate();

const result = gs.calculate({
  negation_count: 1,           // "no send am today"
  amount_deviation: 15,        // 15% above historical average
  channel_connected: true,     // WhatsApp connected
  transcript_drift: 0.12,      // Low drift
  health_score: 0.8,          // Good wellness
});

// Result:
// g_neg = 1 * 0.5 = 0.5
// g_amt = min(15/10, 2) = 1.5
// g_ch = 0
// g_drift = 0.12
// g_health = (1 - 0.8) * 0.5 = 0.1
// Total = 1.5*0.5 + 1.2*1.5 + 1.0*0 + 1.0*0.12 + 1.1*0.1
//       = 0.75 + 1.8 + 0 + 0.12 + 0.11 = 2.78
// Outcome: auto_stage (< 3.0)
```

---

## 8.3 Entity Extractor

**File:** `src/lib/meaning-engine/entity-extractor.ts`

### Purpose

Extracts structured business entities from transcripts using LLM with CME constraint enrichment.

### Types

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
```

### Extraction Prompt

```typescript
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
```

### Mode Inference

```typescript
function determineMode(type: string): 'ask' | 'learn' | 'do' {
  if (type === 'constraint' || type === 'commitment') return 'do';
  if (type === 'customer' || type === 'item') return 'learn';
  return 'ask';
}
```

### Implementation

```typescript
export class EntityExtractor {
  constructor(private llmProvider: 'claude' | 'gemini' | 'ollama') {}

  async extract(transcript: string, cmeResult: CMEResult): Promise<Entity[]> {
    // Combine transcript with CME constraints
    const enrichedPrompt = EXTRACTION_PROMPT + transcript +
      '\n\nCME detected constraints: ' + JSON.stringify(cmeResult.constraints);

    // Call LLM
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

    // Validate against Zod schema
    const validated = z.array(EntitySchema).safeParse(entities);
    if (!validated.success) {
      throw new Error(`Entity validation failed: ${validated.error.message}`);
    }

    return validated.data;
  }

  private determineMode(type: string): 'ask' | 'learn' | 'do' {
    if (type === 'constraint' || type === 'commitment') return 'do';
    if (type === 'customer' || type === 'item') return 'learn';
    return 'ask';
  }

  private async callLLM(prompt: string): Promise<string> {
    // Implementation depends on provider
    switch (this.llmProvider) {
      case 'claude':
        return this.callClaude(prompt);
      case 'gemini':
        return this.callGemini(prompt);
      case 'ollama':
        return this.callOllama(prompt);
      default:
        throw new Error('Unknown LLM provider');
    }
  }

  private async callClaude(prompt: string): Promise<string> {
    // Implement Anthropic API call
    throw new Error('Not implemented');
  }

  private async callGemini(prompt: string): Promise<string> {
    // Implement Google AI API call
    throw new Error('Not implemented');
  }

  private async callOllama(prompt: string): Promise<string> {
    // Implement Ollama local API call
    throw new Error('Not implemented');
  }
}
```

---

## Unit Tests

### CME Tests

```typescript
// tests/unit/cme.test.ts
import { describe, it, expect } from 'vitest';
import { CulturalMeaningEngine } from '@/lib/meaning-engine/cme';

describe('CulturalMeaningEngine', () => {
  const cme = new CulturalMeaningEngine();

  it('detects verbatim negation in Pidgin', async () => {
    const result = await cme.parse('No send am today', [
      { text: 'No send am today', lang: 'pcm', confidence: 0.95, start_ms: 0, end_ms: 1500 },
    ]);

    expect(result.verbatim_negations).toHaveLength(1);
    expect(result.constraints.some(c => c.severity === 'hard_block')).toBe(true);
  });

  it('grounds idioms correctly', async () => {
    const result = await cme.parse('Send am small small', [
      { text: 'small small', lang: 'pcm', confidence: 0.92, start_ms: 1000, end_ms: 1800 },
    ]);

    expect(result.idioms.some(i => i.grounded === 'batch_mode')).toBe(true);
  });

  it('detects fuzzy negation', async () => {
    const result = await cme.parse('Wait, maybe send am later', [
      { text: 'Wait, maybe send am later', lang: 'en', confidence: 0.90, start_ms: 0, end_ms: 2000 },
    ]);

    expect(result.fuzzy_negations.length).toBeGreaterThan(0);
    expect(result.constraints.some(c => c.severity === 'soft_warning')).toBe(true);
  });
});
```

### Gs Gate Tests

```typescript
// tests/unit/gs-gate.test.ts
import { describe, it, expect } from 'vitest';
import { SafeguardGate } from '@/lib/meaning-engine/gs-gate';

describe('SafeguardGate', () => {
  const gs = new SafeguardGate();

  it('returns auto_stage for low risk', () => {
    const result = gs.calculate({
      negation_count: 0,
      amount_deviation: 5,
      channel_connected: true,
      transcript_drift: 0.05,
      health_score: 0.9,
    });

    expect(result.score).toBeLessThan(3.0);
    expect(result.gate_outcome).toBe('auto_stage');
  });

  it('returns blocked for high negation count', () => {
    const result = gs.calculate({
      negation_count: 5, // Multiple negations
      amount_deviation: 50,
      channel_connected: false,
      transcript_drift: 0.8,
      health_score: 0.3,
    });

    expect(result.score).toBeGreaterThanOrEqual(7.0);
    expect(result.gate_outcome).toBe('blocked');
  });
});
```
