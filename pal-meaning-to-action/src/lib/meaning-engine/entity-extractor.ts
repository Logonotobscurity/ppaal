/**
 * Entity Extractor
 * 
 * Extracts structured entities from processed transcripts.
 * Works in conjunction with CME and Gs Gate.
 * 
 * Entity Types:
 * - customer: Business customer or client
 * - supplier: Vendor or service provider
 * - amount: Monetary value
 * - date: Transaction or reminder date
 * - item: Product or service
 * - commitment: Promise or obligation
 * - constraint: Condition or limitation
 */

import { z } from 'zod';
import type { CMEResult, VoiceMode } from './cme';

/**
 * Extracted entity types
 */
export type EntityType =
  | 'customer'
  | 'supplier'
  | 'amount'
  | 'date'
  | 'item'
  | 'commitment'
  | 'constraint';

/**
 * Single extracted entity
 */
export interface ExtractedEntity {
  type: EntityType;
  text: string;
  value: string | number | Date;
  confidence: number;
  startIndex?: number;
  endIndex?: number;
  metadata?: Record<string, unknown>;
}

/**
 * Full entity extraction result
 */
export interface EntityExtractionResult {
  entities: ExtractedEntity[];
  mode: VoiceMode;
  intent: string;
  confidence: number;
}

/**
 * Zod schema for entity extraction validation
 */
export const EntityExtractionSchema = z.object({
  entities: z.array(
    z.object({
      type: z.enum(['customer', 'supplier', 'amount', 'date', 'item', 'commitment', 'constraint']),
      text: z.string(),
      value: z.union([z.string(), z.number(), z.date()]),
      confidence: z.number().min(0).max(1),
      startIndex: z.number().int().min(0).optional(),
      endIndex: z.number().int().optional(),
      metadata: z.record(z.string(), z.unknown()).optional(),
    })
  ),
  mode: z.enum(['ASK', 'LEARN', 'DO']).default('ASK'),
  intent: z.string(),
  confidence: z.number().min(0).max(1),
});

/**
 * Pattern matchers for entity extraction
 */
const PATTERNS = {
  // Currency amounts (NGN, USD, etc.)
  amount: /\b₦?\s*(\d{1,3}(,\d{3})*(\.\d{2})?)\s*(NGN|USD|EUR|GBP)?\b/gi,
  
  // Dates (various formats)
  date: /\b(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|today|tomorrow|next\s+\w+|in\s+\d+\s+(days?|weeks?|months?))\b/gi,
  
  // Customer/supplier indicators
  customer: /\b(customer|client|buyer|payer|they|them)\s+(named?|called|is)?\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/gi,
  supplier: /\b(supplier|vendor|seller|provider)\s+(named?|called|is)?\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/gi,
  
  // Items/products
  item: /\b(buy|sell|purchase|order|get)\s+(.+?)(?:for|from|to)\b/gi,
};

/**
 * Mode inference keywords
 */
const MODE_KEYWORDS: Record<VoiceMode, string[]> = {
  ASK: ['check', 'see', 'find', 'what', 'when', 'how', 'who', 'where', 'show', 'list'],
  LEARN: ['remember', 'note', 'save', 'add', 'update', 'learn', 'store', 'record'],
  DO: ['send', 'pay', 'collect', 'remind', 'call', 'email', 'message', 'approve', 'reject'],
};

/**
 * Intent patterns
 */
const INTENT_PATTERNS: Record<string, RegExp> = {
  payment_reminder: /\b(remind|reminder|follow[- ]up)\s+(about\s+)?payment\b/i,
  payment_send: /\b(send|transfer|pay)\s+(them|him|her|[A-Z][a-z]+)\b/i,
  collection_request: /\b(collect|ask\s+for|request)\s+(payment|money|amount)\b/i,
  status_check: /\b(check|see|find)\s+(status|state|progress)\b/i,
  entity_create: /\b(add|create|new|save)\s+(customer|supplier|contact)\b/i,
};

/**
 * Extract entities from processed transcript
 * 
 * @param transcript - Processed transcript from CME
 * @param cmeResult - Optional CME result for context
 * @returns Extraction result with entities, mode, and intent
 * 
 * @example
 * ```typescript
 * const result = extractEntities('Send ₦50,000 to John tomorrow');
 * console.log(result.entities);
 * // [
 * //   { type: 'amount', value: 50000, ... },
 * //   { type: 'customer', text: 'John', ... },
 * //   { type: 'date', text: 'tomorrow', ... }
 * // ]
 * ```
 */
export function extractEntities(transcript: string, cmeResult?: CMEResult): EntityExtractionResult {
  const entities: ExtractedEntity[] = [];
  const lowerTranscript = transcript.toLowerCase();

  // Extract amounts
  extractAmounts(transcript, entities);

  // Extract dates
  extractDates(transcript, entities);

  // Extract customers/suppliers
  extractPeople(transcript, entities);

  // Extract items
  extractItems(transcript, entities);

  // Infer mode from keywords
  const mode = inferMode(transcript, cmeResult);

  // Detect intent
  const intent = detectIntent(lowerTranscript);

  // Calculate overall confidence
  const confidence = calculateExtractionConfidence(entities, mode);

  return {
    entities,
    mode,
    intent,
    confidence,
  };
}

/**
 * Infer voice mode from transcript and CME result
 */
export function inferMode(transcript: string, cmeResult?: CMEResult): VoiceMode {
  const lower = transcript.toLowerCase();

  // Check for explicit mode keywords
  for (const [modeStr, keywords] of Object.entries(MODE_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lower.includes(keyword.toLowerCase())) {
        return modeStr as VoiceMode;
      }
    }
  }

  // Infer from CME grounded meanings
  if (cmeResult?.idioms) {
    const groundedActions = cmeResult.idioms.map((i) => i.grounded);
    if (groundedActions.includes('approve') || groundedActions.includes('batch_mode')) {
      return 'DO';
    }
    if (groundedActions.includes('understood') || groundedActions.includes('discuss')) {
      return 'ASK';
    }
  }

  // Default based on sentence structure
  if (lower.startsWith('send ') || lower.startsWith('pay ') || lower.startsWith('collect ')) {
    return 'DO';
  }
  if (lower.startsWith('remember ') || lower.startsWith('note ')) {
    return 'LEARN';
  }

  return 'ASK'; // Default to read mode
}

/**
 * Extract monetary amounts
 */
function extractAmounts(transcript: string, entities: ExtractedEntity[]): void {
  const matches = transcript.matchAll(PATTERNS.amount);
  for (const match of matches) {
    const numericPart = match[1].replace(/,/g, '');
    const currency = match[4] || 'NGN';
    const value = parseFloat(numericPart);

    entities.push({
      type: 'amount',
      text: match[0],
      value: currency === 'USD' ? value * 1500 : value, // Normalize to NGN
      confidence: 0.95,
      startIndex: match.index,
      endIndex: match.index + match[0].length,
      metadata: { original: numericPart, currency },
    });
  }
}

/**
 * Extract dates
 */
function extractDates(transcript: string, entities: ExtractedEntity[]): void {
  const matches = transcript.matchAll(PATTERNS.date);
  for (const match of matches) {
    let dateValue: Date;
    const text = match[0].toLowerCase();

    if (text === 'today') {
      dateValue = new Date();
    } else if (text === 'tomorrow') {
      dateValue = new Date();
      dateValue.setDate(dateValue.getDate() + 1);
    } else {
      dateValue = new Date(match[0]);
    }

    entities.push({
      type: 'date',
      text: match[0],
      value: dateValue,
      confidence: 0.85,
      startIndex: match.index,
      endIndex: match.index + match[0].length,
    });
  }
}

/**
 * Extract people (customers/suppliers)
 */
function extractPeople(transcript: string, entities: ExtractedEntity[]): void {
  // Simple name extraction after customer/supplier keywords
  const customerMatches = transcript.matchAll(PATTERNS.customer);
  for (const match of customerMatches) {
    const name = match[3];
    if (name && name.length > 2) {
      entities.push({
        type: 'customer',
        text: name,
        value: name,
        confidence: 0.8,
        startIndex: match.index,
      });
    }
  }

  const supplierMatches = transcript.matchAll(PATTERNS.supplier);
  for (const match of supplierMatches) {
    const name = match[3];
    if (name && name.length > 2) {
      entities.push({
        type: 'supplier',
        text: name,
        value: name,
        confidence: 0.8,
        startIndex: match.index,
      });
    }
  }
}

/**
 * Extract items/products
 */
function extractItems(transcript: string, entities: ExtractedEntity[]): void {
  const matches = transcript.matchAll(PATTERNS.item);
  for (const match of matches) {
    const itemText = match[2]?.trim();
    if (itemText && itemText.length > 2) {
      entities.push({
        type: 'item',
        text: itemText,
        value: itemText,
        confidence: 0.75,
        startIndex: match.index,
      });
    }
  }
}

/**
 * Detect user intent
 */
function detectIntent(transcript: string): string {
  for (const [intent, pattern] of Object.entries(INTENT_PATTERNS)) {
    if (pattern.test(transcript)) {
      return intent;
    }
  }
  return 'general';
}

/**
 * Calculate extraction confidence
 */
function calculateExtractionConfidence(entities: ExtractedEntity[], mode: VoiceMode): number {
  if (entities.length === 0) return 0.3;

  const avgConfidence = entities.reduce((sum, e) => sum + e.confidence, 0) / entities.length;
  
  // Bonus for having key entities based on mode
  let bonus = 0;
  if (mode === 'DO') {
    const hasAmount = entities.some((e) => e.type === 'amount');
    const hasTarget = entities.some((e) => e.type === 'customer' || e.type === 'supplier');
    if (hasAmount && hasTarget) bonus += 0.2;
  }

  return Math.min(1, avgConfidence + bonus);
}

/**
 * Get entities by type
 */
export function getEntitiesByType(entities: ExtractedEntity[], type: EntityType): ExtractedEntity[] {
  return entities.filter((e) => e.type === type);
}

/**
 * Get first entity of type
 */
export function getFirstEntity(entities: ExtractedEntity[], type: EntityType): ExtractedEntity | null {
  return entities.find((e) => e.type === type) || null;
}
