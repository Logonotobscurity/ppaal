/**
 * @module negation-parser
 * @description Detects verbatim and fuzzy negations in African code-switched speech
 * @pattern Service Layer Pattern
 */

export interface NegationMatch {
  phrase: string;
  confidence: number;
  start_index: number;
  end_index: number;
  type: 'verbatim' | 'fuzzy';
}

/**
 * Verbatim negation patterns across supported languages
 * These are hard blocks that trigger immediate Gs penalty
 */
const VERBATIM_PATTERNS: Record<string, RegExp[]> = {
  pidgin: [
    /\bno\s+send\b/i,           // "no send am"
    /\bno\s+go\b/i,             // "no go do it"
    /\bno\s+fit\b/i,            // "no fit come"
    /\bma\s+se\b/i,             // "ma se" (don't do it)
    /\bshine\s+your\s+eye\b/i,  // "shine your eye" (be careful/don't)
  ],
  yoruba: [
    /\bkò\b/i,                  // "kò" (no/not)
    /\bmá\b/i,                  // "má" (don't)
    /\bèmi\s+kò\b/i,            // "emi kò" (I won't)
  ],
  igbo: [
    /\baghaghị\b/i,             // "aghaghi" (should not)
    /\bèkwù\b/i,                // "ekwu" (don't say)
  ],
  hausa: [
    /\bkada\b/i,                // "kada" (don't)
    /\bba\s+zai\b/i,            // "ba zai" (he will not)
  ],
  english: [
    /\bdon'?t\s+(send|transfer|pay|give)\b/i,
    /\bwon'?t\b/i,
    /\bcannot\b/i,
    /\bcan'?t\b/i,
    /\bnever\b/i,
  ],
};

/**
 * Fuzzy negation patterns - soft warnings
 * These indicate hesitation or uncertainty
 */
const FUZZY_PATTERNS: Record<string, RegExp[]> = {
  pidgin: [
    /\bwait\b/i,
    /\bhold\s+on\b/i,
    /\bmake\s+I\b/i,            // "make I check" (let me check)
    /\babi\b/i,                 // "abi?" (right?/uncertain)
  ],
  yoruba: [
    /\bǹjẹ́\b/i,                // "ńjẹ́" (question marker)
    /\bó\b/i,                   // uncertain particle
  ],
  igbo: [
    /\bgịnị\b/i,                // "ginị" (what?)
    /\bka\b/i,                  // uncertain particle
  ],
  hausa: [
    /\bko\b/i,                  // "ko" (or/question)
    /\bwata\b/i,                // "wata" (maybe)
  ],
  english: [
    /\bmaybe\b/i,
    /\bperhaps\b/i,
    /\bI\s+think\b/i,
    /\blet\s+me\s+check\b/i,
    /\bare\s+you\s+sure\b/i,
  ],
};

/**
 * Parse transcript for negations
 * @param transcript - Raw text from STT
 * @returns Array of detected negations with metadata
 */
export function parseNegations(transcript: string): NegationMatch[] {
  if (!transcript || transcript.trim().length === 0) {
    return [];
  }

  const matches: NegationMatch[] = [];
  const lowerTranscript = transcript.toLowerCase();

  // Check verbatim patterns
  for (const [, patterns] of Object.entries(VERBATIM_PATTERNS)) {
    for (const pattern of patterns) {
      const match = pattern.exec(lowerTranscript);
      if (match && match.index !== undefined) {
        matches.push({
          phrase: match[0],
          confidence: 0.95, // High confidence for verbatim
          start_index: match.index,
          end_index: match.index + match[0].length,
          type: 'verbatim',
        });
      }
    }
  }

  // Check fuzzy patterns
  for (const [, patterns] of Object.entries(FUZZY_PATTERNS)) {
    for (const pattern of patterns) {
      const match = pattern.exec(lowerTranscript);
      if (match && match.index !== undefined) {
        matches.push({
          phrase: match[0],
          confidence: 0.65, // Lower confidence for fuzzy
          start_index: match.index,
          end_index: match.index + match[0].length,
          type: 'fuzzy',
        });
      }
    }
  }

  // Sort by confidence (highest first)
  return matches.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Calculate negation score for Gs gate
 * @param negations - Array of detected negations
 * @returns Score component for g_neg (0-3 scale)
 */
export function calculateNegationScore(negations: NegationMatch[]): number {
  if (negations.length === 0) {
    return 0;
  }

  const verbatimCount = negations.filter(n => n.type === 'verbatim').length;
  const fuzzyCount = negations.filter(n => n.type === 'fuzzy').length;

  // Verbatim negations have severe impact
  const verbatimScore = Math.min(verbatimCount * 1.5, 3.0);
  
  // Fuzzy negations have mild impact
  const fuzzyScore = Math.min(fuzzyCount * 0.3, 0.9);

  return Math.min(verbatimScore + fuzzyScore, 3.0);
}

/**
 * Get human-readable explanation of negations
 * @param negations - Array of detected negations
 * @returns Explanation string for UI display
 */
export function explainNegations(negations: NegationMatch[]): string {
  if (negations.length === 0) {
    return 'No negations detected.';
  }

  const verbatim = negations.filter(n => n.type === 'verbatim');
  const fuzzy = negations.filter(n => n.type === 'fuzzy');

  const parts: string[] = [];

  if (verbatim.length > 0) {
    parts.push(`⚠️ Strong negation detected: "${verbatim[0].phrase}"`);
  }

  if (fuzzy.length > 0) {
    parts.push(`❓ Hesitation detected: ${fuzzy.map(f => `"${f.phrase}"`).join(', ')}`);
  }

  return parts.join(' | ');
}
