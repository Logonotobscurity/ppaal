/**
 * @module entity-extractor
 * @description Extracts structured business entities from voice transcripts
 *              using LLM-based extraction with CME constraint awareness.
 * @pattern Service Layer Pattern
 */

import { z } from 'zod';
import type { CMEResult } from './cme.js';

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

/** Default empty CME result when not provided */
const DEFAULT_CME_RESULT: CMEResult = {
  verbatim_negations: [],
  fuzzy_negations: [],
  idioms: [],
  constraints: [],
  lexicon_version: 'v1.0.0',
};

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

Transcript: `;

export interface ExtractionOptions {
  maxEntities?: number;
  minConfidence?: number;
}

export class EntityExtractor {
  private llmProvider: 'claude' | 'gemini' | 'ollama';

  constructor(llmProvider: 'claude' | 'gemini' | 'ollama' = 'claude') {
    this.llmProvider = llmProvider;
  }

  /**
   * Extract entities from a transcript.
   * @param transcript - The raw text to extract entities from
   * @param cmeResult - Optional CME analysis result (defaults to empty)
   * @param options - Optional extraction configuration
   * @returns Array of extracted entities
   */
  async extract(
    transcript: string,
    cmeResult: CMEResult = DEFAULT_CME_RESULT,
    options?: ExtractionOptions
  ): Promise<Entity[]> {
    if (!transcript || transcript.trim().length === 0) {
      return [];
    }

    const maxEntities = options?.maxEntities ?? 20;
    const minConfidence = options?.minConfidence ?? 0.5;

    // Build enriched prompt with CME constraints
    const enrichedPrompt = this.buildPrompt(transcript, cmeResult);

    // Call LLM
    const response = await this.callLLM(enrichedPrompt);

    // Parse and validate response
    const entities = this.parseResponse(response, minConfidence);

    return entities.slice(0, maxEntities);
  }

  private buildPrompt(transcript: string, cmeResult: CMEResult): string {
    let prompt = EXTRACTION_PROMPT + transcript;

    // Append CME constraints if any exist
    if (cmeResult.constraints.length > 0) {
      prompt += '\n\nDetected constraints from Cultural Meaning Engine: ';
      prompt += JSON.stringify(cmeResult.constraints);
    }

    if (cmeResult.verbatim_negations.length > 0) {
      prompt += '\n\nIMPORTANT: The following negations were detected and MUST be preserved as constraint entities: ';
      prompt += JSON.stringify(cmeResult.verbatim_negations.map((n: { phrase: string }) => n.phrase));
    }

    return prompt;
  }

  private parseResponse(response: string, minConfidence: number): Entity[] {
    try {
      // Clean response (remove markdown code fences if present)
      const cleaned = response
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      const raw = JSON.parse(cleaned);

      if (!Array.isArray(raw)) {
        console.warn('EntityExtractor: LLM returned non-array response');
        return [];
      }

      const entities: Entity[] = raw
        .filter((e: unknown) => {
          if (typeof e !== 'object' || e === null) return false;
          const obj = e as Record<string, unknown>;
          return typeof obj.type === 'string' && obj.value !== undefined;
        })
        .map((e: Record<string, unknown>, i: number) => ({
          id: `entity_${Date.now()}_${i}`,
          type: e.type as Entity['type'],
          value: e.value as string | number,
          confidence: typeof e.confidence === 'number' ? e.confidence : 0.7,
          evidence: {
            start_ms: typeof e.start_ms === 'number' ? e.start_ms : 0,
            end_ms: typeof e.end_ms === 'number' ? e.end_ms : 0,
          },
          mode: this.determineMode(e.type as string),
        }))
        .filter((e: Entity) => e.confidence >= minConfidence);

      return entities;
    } catch (error) {
      console.error('EntityExtractor: Failed to parse LLM response', error);
      return [];
    }
  }

  private determineMode(type: string): 'ask' | 'learn' | 'do' {
    if (type === 'constraint' || type === 'commitment') return 'do';
    if (type === 'customer' || type === 'item') return 'learn';
    return 'ask';
  }

  private async callLLM(prompt: string): Promise<string> {
    switch (this.llmProvider) {
      case 'claude':
        return this.callClaude(prompt);
      case 'gemini':
        return this.callGemini(prompt);
      case 'ollama':
        return this.callOllama(prompt);
      default:
        throw new Error(`Unknown LLM provider: ${this.llmProvider}`);
    }
  }

  private async callClaude(_prompt: string): Promise<string> {
    // Wire up to Anthropic API
    // For now, return empty array as JSON
    console.warn('EntityExtractor: Claude API not yet configured');
    return '[]';
  }

  private async callGemini(_prompt: string): Promise<string> {
    console.warn('EntityExtractor: Gemini API not yet configured');
    return '[]';
  }

  private async callOllama(prompt: string): Promise<string> {
    try {
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama3.1:8b',
          prompt,
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama request failed: ${response.status}`);
      }

      const data = await response.json();
      return data.response || '[]';
    } catch (error) {
      console.error('EntityExtractor: Ollama call failed', error);
      return '[]';
    }
  }
}

/**
 * Infer mode from entity type
 * @param entityType - The type of entity
 * @returns The inferred mode (ask/learn/do)
 */
export function inferMode(entityType: string): 'ask' | 'learn' | 'do' {
  if (entityType === 'constraint' || entityType === 'commitment') return 'do';
  if (entityType === 'customer' || entityType === 'item') return 'learn';
  return 'ask';
}
