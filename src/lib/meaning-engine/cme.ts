/**
 * @module cme
 * @description Cultural Meaning Engine - Core intelligence layer for African code-switched speech
 * @pattern Service Layer Pattern
 * 
 * The CME is the first layer (L0) that processes all voice input before any AI reasoning.
 * It handles:
 * - Verbatim negation detection (hard blocks)
 * - Fuzzy negation detection (soft warnings)
 * - Idiom grounding to business logic
 * - Constraint extraction
 */

import { parseNegations } from './negation-parser';
import { groundIdioms } from './idiom-grounding';

export interface CMEResult {
  verbatim_negations: Array<{ phrase: string; confidence: number }>;
  fuzzy_negations: Array<{ phrase: string; confidence: number }>;
  idioms: Array<{ original: string; grounded: string }>;
  constraints: Array<{ type: string; condition: string; severity: string }>;
  lexicon_version: string;
}

export interface CMEOptions {
  enable_idiom_grounding?: boolean;
  enable_constraint_extraction?: boolean;
  min_confidence?: number;
}

const DEFAULT_OPTIONS: Required<CMEOptions> = {
  enable_idiom_grounding: true,
  enable_constraint_extraction: true,
  min_confidence: 0.5,
};

/**
 * Process transcript through Cultural Meaning Engine
 * @param transcript - Raw text from STT
 * @param options - CME configuration options
 * @returns Structured CME result with negations, idioms, and constraints
 */
export function processCME(
  transcript: string,
  options: CMEOptions = {}
): CMEResult {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  if (!transcript || transcript.trim().length === 0) {
    return {
      verbatim_negations: [],
      fuzzy_negations: [],
      idioms: [],
      constraints: [],
      lexicon_version: 'v1.0.0',
    };
  }

  // Step 1: Parse negations
  const negations = parseNegations(transcript);
  const verbatim_negations = negations
    .filter(n => n.type === 'verbatim' && n.confidence >= opts.min_confidence)
    .map(n => ({ phrase: n.phrase, confidence: n.confidence }));

  const fuzzy_negations = negations
    .filter(n => n.type === 'fuzzy' && n.confidence >= opts.min_confidence)
    .map(n => ({ phrase: n.phrase, confidence: n.confidence }));

  // Step 2: Ground idioms (if enabled)
  let idioms: Array<{ original: string; grounded: string }> = [];
  if (opts.enable_idiom_grounding) {
    const idiomMatches = groundIdioms(transcript);
    idioms = idiomMatches.map(i => ({
      original: i.original,
      grounded: i.grounded,
    }));
  }

  // Step 3: Extract constraints (if enabled)
  let constraints: Array<{ type: string; condition: string; severity: string }> = [];
  if (opts.enable_constraint_extraction) {
    constraints = extractConstraints(verbatim_negations, fuzzy_negations, idioms);
  }

  return {
    verbatim_negations,
    fuzzy_negations,
    idioms,
    constraints,
    lexicon_version: 'v1.0.0',
  };
}

/**
 * Extract structured constraints from CME analysis
 * @param verbatim - Verbatim negations
 * @param fuzzy - Fuzzy negations
 * @param idioms - Grounded idioms
 * @returns Array of constraint objects
 */
function extractConstraints(
  verbatim: Array<{ phrase: string; confidence: number }>,
  fuzzy: Array<{ phrase: string; confidence: number }>,
  idioms: Array<{ original: string; grounded: string }>
): Array<{ type: string; condition: string; severity: string }> {
  const constraints: Array<{ type: string; condition: string; severity: string }> = [];

  // Convert verbatim negations to hard constraints
  for (const neg of verbatim) {
    constraints.push({
      type: 'negation_block',
      condition: `transcript contains "${neg.phrase}"`,
      severity: 'high',
    });
  }

  // Convert fuzzy negations to soft constraints
  for (const neg of fuzzy) {
    constraints.push({
      type: 'hesitation_warning',
      condition: `transcript contains "${neg.phrase}"`,
      severity: 'low',
    });
  }

  // Convert idioms to business logic constraints
  for (const idiom of idioms) {
    if (idiom.grounded.includes('batch_mode')) {
      constraints.push({
        type: 'batch_requirement',
        condition: `idiom "${idiom.original}" detected`,
        severity: 'medium',
      });
    }
    if (idiom.grounded.includes('defer')) {
      constraints.push({
        type: 'deferral_required',
        condition: `idiom "${idiom.original}" detected`,
        severity: 'high',
      });
    }
  }

  return constraints;
}

/**
 * Check if transcript contains blocking negations
 * @param cmeResult - CME analysis result
 * @returns True if action should be blocked
 */
export function hasBlockingNegation(cmeResult: CMEResult): boolean {
  return cmeResult.verbatim_negations.length > 0;
}

/**
 * Get summary of CME analysis for UI display
 * @param cmeResult - CME analysis result
 * @returns Human-readable summary
 */
export function summarizeCME(cmeResult: CMEResult): string {
  const parts: string[] = [];

  if (cmeResult.verbatim_negations.length > 0) {
    parts.push(`⚠️ ${cmeResult.verbatim_negations.length} strong negation(s)`);
  }

  if (cmeResult.fuzzy_negations.length > 0) {
    parts.push(`❓ ${cmeResult.fuzzy_negations.length} hesitation(s)`);
  }

  if (cmeResult.idioms.length > 0) {
    parts.push(`🌍 ${cmeResult.idioms.length} idiom(s) grounded`);
  }

  if (cmeResult.constraints.length > 0) {
    parts.push(`🔒 ${cmeResult.constraints.length} constraint(s)`);
  }

  if (parts.length === 0) {
    return '✅ No cultural meaning issues detected.';
  }

  return parts.join(' | ');
}
