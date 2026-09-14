/**
 * Cultural Meaning Engine (CME)
 * 
 * Layer 0 of the PAL architecture.
 * Transforms code-switched African speech into structured meaning.
 * 
 * Pipeline: Raw Transcript → Negation Detection → Idiom Grounding → Enriched Meaning
 */

import { z } from 'zod';

/**
 * Voice mode for PAL interactions
 */
export type VoiceMode = 'ASK' | 'LEARN' | 'DO';

/**
 * CME processing result
 */
export interface CMEResult {
  originalTranscript: string;
  processedTranscript: string;
  negations: NegationMatch[];
  idioms: IdiomMatch[];
  languageMix: LanguageMix;
  confidence: number;
}

/**
 * Detected negation with type and position
 */
export interface NegationMatch {
  text: string;
  type: 'hard' | 'soft';
  startIndex: number;
  endIndex: number;
  language: 'en' | 'pcm' | 'yo' | 'ig' | 'ha';
}

/**
 * Detected idiom with grounding
 */
export interface IdiomMatch {
  original: string;
  grounded: string;
  meaning: string;
  startIndex: number;
  endIndex: number;
  language: 'pcm' | 'yo' | 'ig' | 'ha';
}

/**
 * Language mixture detection
 */
export interface LanguageMix {
  primary: string;
  detected: string[];
  codeSwitchCount: number;
}

/**
 * Zod schema for CME result validation
 */
export const CMEResultSchema = z.object({
  originalTranscript: z.string(),
  processedTranscript: z.string(),
  negations: z.array(
    z.object({
      text: z.string(),
      type: z.enum(['hard', 'soft']),
      startIndex: z.number().int().min(0),
      endIndex: z.number().int(),
      language: z.enum(['en', 'pcm', 'yo', 'ig', 'ha']),
    })
  ),
  idioms: z.array(
    z.object({
      original: z.string(),
      grounded: z.string(),
      meaning: z.string(),
      startIndex: z.number().int().min(0),
      endIndex: z.number().int(),
      language: z.enum(['pcm', 'yo', 'ig', 'ha']),
    })
  ),
  languageMix: z.object({
    primary: z.string(),
    detected: z.array(z.string()),
    codeSwitchCount: z.number().int().min(0),
  }),
  confidence: z.number().min(0).max(1),
});

/**
 * Hard negation patterns by language
 * These block action execution completely
 */
const HARD_NEGATIONS: Record<string, string[]> = {
  en: ['no', "don't", 'do not', 'never', 'stop', 'cancel'],
  pcm: ['no send am', 'no go', 'no fit', 'sotay', 'abeg no'],
  yo: ['ko si', 'ma se', 'je ki n'],
  ig: ['aghi m', 'ela', 'chọghị m'],
  ha: ['ba', 'kada', 'ni kasa'],
};

/**
 * Soft negation patterns by language
 * These trigger warnings but don't block
 */
const SOFT_NEGATIONS: Record<string, string[]> = {
  en: ['wait', 'hold on', 'maybe', 'later', 'think about'],
  pcm: ['wait o', 'make i think', 'small small', 'after while'],
  yo: ['duro', 'se e se', 'lehin naa'],
  ig: ['chee', 'ka e mechaa', 'ntakịrị ntakịrị'],
  ha: ['jira', 'bayani', 'dan lokaci'],
};

/**
 * Idiom grounding dictionary
 * Maps African idioms to business actions
 */
const IDIOM_GROUNDING: Record<string, { grounded: string; meaning: string }> = {
  // Pidgin
  'small small': { grounded: 'batch_mode', meaning: 'Process in small batches' },
  'shenk am': { grounded: 'approve', meaning: 'Approve immediately' },
  'no be now': { grounded: 'defer', meaning: 'Defer to later' },
  'wetin concern': { grounded: 'clarify', meaning: 'Request clarification' },
  'make we yarn': { grounded: 'discuss', meaning: 'Initiate discussion' },
  
  // Yorùbá
  'slowly slowly': { grounded: 'batch_mode', meaning: 'Process gradually' },
  'o ti ye mi': { grounded: 'understood', meaning: 'Understood clearly' },
  
  // Igbo
  'ntakịrị ntakịrị': { grounded: 'batch_mode', meaning: 'Little by little' },
  'ọ dị mma': { grounded: 'approve', meaning: 'It is good' },
  
  // Hausa
  'sannu sannu': { grounded: 'batch_mode', meaning: 'Slowly slowly' },
  'ya kamata': { grounded: 'approve', meaning: 'It should be done' },
};

/**
 * Process transcript through CME pipeline
 * 
 * @param transcript - Raw speech transcript (may be code-switched)
 * @returns CME result with negations, idioms, and language mix
 * 
 * @example
 * ```typescript
 * const result = processMeaning('No send am, make we yarn first');
 * console.log(result.negations); // [{ text: 'no send am', type: 'hard', ... }]
 * console.log(result.idioms);    // [{ original: 'make we yarn', grounded: 'discuss', ... }]
 * ```
 */
export function processMeaning(transcript: string): CMEResult {
  const lowerTranscript = transcript.toLowerCase();
  const negations: NegationMatch[] = [];
  const idioms: IdiomMatch[] = [];
  
  // Step 1: Detect negations
  detectNegations(lowerTranscript, negations);
  
  // Step 2: Ground idioms
  groundIdioms(lowerTranscript, idioms);
  
  // Step 3: Detect language mix
  const languageMix = detectLanguageMix(transcript);
  
  // Step 4: Calculate confidence
  const confidence = calculateConfidence(transcript, negations, idioms, languageMix);
  
  // Step 5: Build processed transcript
  let processedTranscript = transcript;
  for (const idiom of idioms) {
    processedTranscript = processedTranscript.replace(
      new RegExp(idiom.original, 'gi'),
      idiom.grounded
    );
  }
  
  return {
    originalTranscript: transcript,
    processedTranscript,
    negations,
    idioms,
    languageMix,
    confidence,
  };
}

/**
 * Detect negations in transcript
 */
function detectNegations(transcript: string, matches: NegationMatch[]): void {
  // Check hard negations
  for (const [lang, patterns] of Object.entries(HARD_NEGATIONS)) {
    for (const pattern of patterns) {
      const regex = new RegExp(`\\b${escapeRegex(pattern)}\\b`, 'gi');
      let match: RegExpExecArray | null;
      while ((match = regex.exec(transcript)) !== null) {
        matches.push({
          text: match[0],
          type: 'hard',
          startIndex: match.index,
          endIndex: match.index + match[0].length,
          language: lang as NegationMatch['language'],
        });
      }
    }
  }
  
  // Check soft negations
  for (const [lang, patterns] of Object.entries(SOFT_NEGATIONS)) {
    for (const pattern of patterns) {
      const regex = new RegExp(`\\b${escapeRegex(pattern)}\\b`, 'gi');
      let match: RegExpExecArray | null;
      while ((match = regex.exec(transcript)) !== null) {
        matches.push({
          text: match[0],
          type: 'soft',
          startIndex: match.index,
          endIndex: match.index + match[0].length,
          language: lang as NegationMatch['language'],
        });
      }
    }
  }
}

/**
 * Ground idioms to business actions
 */
function groundIdioms(transcript: string, matches: IdiomMatch[]): void {
  for (const [original, grounding] of Object.entries(IDIOM_GROUNDING)) {
    const regex = new RegExp(`\\b${escapeRegex(original)}\\b`, 'gi');
    let match: RegExpExecArray | null;
    while ((match = regex.exec(transcript)) !== null) {
      matches.push({
        original: match[0],
        grounded: grounding.grounded,
        meaning: grounding.meaning,
        startIndex: match.index,
        endIndex: match.index + match[0].length,
        language: detectIdiomLanguage(original),
      });
    }
  }
}

/**
 * Detect language mixture in transcript
 */
function detectLanguageMix(transcript: string): LanguageMix {
  const indicators: Record<string, number> = {
    en: 0,
    pcm: 0,
    yo: 0,
    ig: 0,
    ha: 0,
  };
  
  // Simple heuristic based on common words
  const pcmWords = ['make', 'we', 'dey', 'na', 'wetin', 'abi', 'o', 'wahala'];
  const yoWords = ['ti', 'si', 'wa', 'ni', 'omo', 'oga'];
  const igWords = ['na', 'di', 'm', 'ọ', 'ị', 'ụ'];
  const haWords = ['ne', 'ce', 'mai', 'da', 'sunan'];
  
  const words = transcript.toLowerCase().split(/\s+/);
  
  for (const word of words) {
    if (pcmWords.includes(word)) indicators.pcm++;
    else if (yoWords.some((w) => word.includes(w))) indicators.yo++;
    else if (igWords.some((w) => word.includes(w))) indicators.ig++;
    else if (haWords.some((w) => word.includes(w))) indicators.ha++;
    else indicators.en++;
  }
  
  const detected = Object.entries(indicators)
    .filter(([_, count]) => count > 0)
    .map(([lang]) => lang);
  
  const primary = Object.entries(indicators).reduce(
    (max, [lang, count]) => (count > max.count ? { lang, count } : max),
    { lang: 'en', count: 0 }
  ).lang;
  
  return {
    primary,
    detected,
    codeSwitchCount: detected.length > 1 ? detected.length - 1 : 0,
  };
}

/**
 * Calculate confidence score for CME processing
 */
function calculateConfidence(
  _transcript: string,
  negations: NegationMatch[],
  idioms: IdiomMatch[],
  languageMix: LanguageMix
): number {
  let confidence = 1.0;
  
  // Reduce confidence for high code-switching
  if (languageMix.codeSwitchCount > 2) {
    confidence -= 0.1 * languageMix.codeSwitchCount;
  }
  
  // Reduce confidence for multiple conflicting negations
  const hardNegations = negations.filter((n) => n.type === 'hard').length;
  const softNegations = negations.filter((n) => n.type === 'soft').length;
  if (hardNegations > 0 && softNegations > 0) {
    confidence -= 0.2;
  }
  
  // Increase confidence for recognized idioms
  confidence += 0.05 * Math.min(idioms.length, 3);
  
  // Ensure bounds
  return Math.max(0, Math.min(1, confidence));
}

/**
 * Escape special regex characters
 */
function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Detect language of an idiom
 */
function detectIdiomLanguage(idiom: string): IdiomMatch['language'] {
  const lower = idiom.toLowerCase();
  if (lower.includes('small') || lower.includes('shenk') || lower.includes('wetin')) {
    return 'pcm';
  }
  if (lower.includes('ti') || lower.includes('si') || lower.includes('omo')) {
    return 'yo';
  }
  if (lower.includes('ị') || lower.includes('ọ') || lower.includes('ụ')) {
    return 'ig';
  }
  if (lower.includes('sannu') || lower.includes('kamata')) {
    return 'ha';
  }
  return 'pcm'; // Default to Pidgin
}

/**
 * Check if transcript contains blocking negation
 */
export function hasBlockingNegation(result: CMEResult): boolean {
  return result.negations.some((n) => n.type === 'hard');
}

/**
 * Get all grounded meanings from idioms
 */
export function getGroundedMeanings(result: CMEResult): string[] {
  return result.idioms.map((i) => i.grounded);
}
