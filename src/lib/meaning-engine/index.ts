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
