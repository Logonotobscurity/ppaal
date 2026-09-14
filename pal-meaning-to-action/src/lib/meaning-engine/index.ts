/**
 * Meaning Engine Module
 * 
 * Exports all components of the PAL meaning processing pipeline:
 * - CME (Cultural Meaning Engine)
 * - Gs Gate (Safeguard Gate)
 * - Entity Extractor
 * - Negation Parser
 * - Idiom Grounding
 */

export {
  processMeaning,
  hasBlockingNegation,
  getGroundedMeanings,
  type CMEResult,
  type NegationMatch,
  type IdiomMatch,
  type LanguageMix,
  CMEResultSchema,
} from './cme';

export {
  calculateGsScore,
  getRiskColor,
  getRiskIcon,
  type GsResult,
  type GsBreakdown,
  type GsLevel,
  type GsContext,
  type HistoricalBehavior,
  type EntityHealth,
  GsResultSchema,
} from './gs-gate';

export {
  extractEntities,
  inferMode,
  type ExtractedEntity,
  type EntityType,
  type EntityExtractionResult,
  EntityExtractionSchema,
} from './entity-extractor';
