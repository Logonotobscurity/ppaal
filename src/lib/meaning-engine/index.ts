/**
 * @module meaning-engine
 * @description Central export for all Cultural Meaning Engine components
 */

export {
  processCME,
  hasBlockingNegation,
  summarizeCME,
  type CMEResult,
  type CMEOptions,
} from './cme';

export {
  parseNegations,
  calculateNegationScore,
  explainNegations,
  type NegationMatch,
} from './negation-parser';

export {
  groundIdioms,
  applyIdiomConstraints,
  explainIdioms,
  type IdiomMatch,
} from './idiom-grounding';

export {
  evaluateGsGate,
  canAutoProceed,
  isBlocked,
  getRequiredConfirmation,
  type GsBreakdown,
  type GsResult,
  type GsInput,
} from './gs-gate';

export {
  EntityExtractor,
  inferMode,
  EntitySchema,
  type Entity,
  type ExtractionOptions,
} from './entity-extractor';

import { processCME, type CMEResult } from './cme';
import { evaluateGsGate, type GsResult } from './gs-gate';
import type { NegationMatch } from './negation-parser';

/** Full meaning pipeline result for a single transcript. */
export interface MeaningResult {
  cme: CMEResult;
  gs: GsResult;
}

/**
 * Interpret a finalized transcript through the constitution-mandated
 * pipeline: CME FIRST, then Gs Gate. Never bypass.
 * @param transcript - Final STT text (may be code-switched)
 * @returns CME analysis + Gs risk assessment
 */
export function interpretTranscript(transcript: string): MeaningResult {
  // Step 1: CME — Cultural Meaning Engine runs FIRST, always
  const cme = processCME(transcript);

  // Step 2: Reconstruct negation matches for the Gs gate scoring function
  const negations: NegationMatch[] = [
    ...cme.verbatim_negations.map((n) => ({
      phrase: n.phrase,
      confidence: n.confidence,
      start_index: 0,
      end_index: 0,
      type: 'verbatim' as const,
    })),
    ...cme.fuzzy_negations.map((n) => ({
      phrase: n.phrase,
      confidence: n.confidence,
      start_index: 0,
      end_index: 0,
      type: 'fuzzy' as const,
    })),
  ];

  // Step 3: Gs Gate — risk assessment before any action
  const gs = evaluateGsGate({
    negations,
    channel: 'voice',
  });

  return { cme, gs };
}
