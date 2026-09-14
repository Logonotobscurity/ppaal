/**
 * @module idiom-grounding
 * @description Grounds African idioms and colloquialisms to actionable business logic
 * @pattern Service Layer Pattern
 */

export interface IdiomMatch {
  original: string;
  grounded: string;
  confidence: number;
  category: 'batch_mode' | 'approval' | 'urgency' | 'constraint' | 'relationship';
}

/**
 * Idiom mappings for African languages
 * Maps colloquial expressions to structured business meanings
 */
const IDIOM_MAPPINGS: Record<string, Array<{ pattern: RegExp; grounded: string; category: IdiomMatch['category'] }>> = {
  pidgin: [
    {
      pattern: /\bsmall\s+small\b/i,
      grounded: 'batch_mode: true',
      category: 'batch_mode',
    },
    {
      pattern: /\bshenk\s+am\b/i,
      grounded: 'action: approve_immediately',
      category: 'approval',
    },
    {
      pattern: /\bmake\s+haste\b/i,
      grounded: 'urgency: high',
      category: 'urgency',
    },
    {
      pattern: /\bno\s+be\s+now\b/i,
      grounded: 'constraint: defer',
      category: 'constraint',
    },
    {
      pattern: /\bmy\s+people\b/i,
      grounded: 'relationship: trusted_contact',
      category: 'relationship',
    },
    {
      pattern: /\barea\s+boy\b/i,
      grounded: 'relationship: high_risk',
      category: 'relationship',
    },
  ],
  yoruba: [
    {
      pattern: /\bkíké\b/i,
      grounded: 'greeting: formal',
      category: 'relationship',
    },
    {
      pattern: /\bẹ\s+kú\b/i,
      grounded: 'greeting: respectful',
      category: 'relationship',
    },
    {
      pattern: /\blójú\b/i,
      grounded: 'urgency: immediate',
      category: 'urgency',
    },
  ],
  igbo: [
    {
      pattern: /\bndewo\b/i,
      grounded: 'greeting: formal',
      category: 'relationship',
    },
    {
      pattern: /\bosó\b/i,
      grounded: 'urgency: high',
      category: 'urgency',
    },
    {
      pattern: /\bnwayọ\b/i,
      grounded: 'batch_mode: true',
      category: 'batch_mode',
    },
  ],
  hausa: [
    {
      pattern:/\bsannu\b/i,
      grounded: 'greeting: formal',
      category: 'relationship',
    },
    {
      pattern: /\bcikin\s+gaggawa\b/i,
      grounded: 'urgency: high',
      category: 'urgency',
    },
    {
      pattern: /\ba\s+hankali\b/i,
      grounded: 'batch_mode: true',
      category: 'batch_mode',
    },
  ],
};

/**
 * Parse transcript for idioms and ground them to business logic
 * @param transcript - Raw text from STT
 * @returns Array of detected idioms with grounded meanings
 */
export function groundIdioms(transcript: string): IdiomMatch[] {
  if (!transcript || transcript.trim().length === 0) {
    return [];
  }

  const matches: IdiomMatch[] = [];
  const lowerTranscript = transcript.toLowerCase();

  for (const [, idioms] of Object.entries(IDIOM_MAPPINGS)) {
    for (const idiom of idioms) {
      const match = idiom.pattern.exec(lowerTranscript);
      if (match && match[0]) {
        matches.push({
          original: match[0],
          grounded: idiom.grounded,
          confidence: 0.85, // High confidence for known idioms
          category: idiom.category,
        });
      }
    }
  }

  return matches;
}

/**
 * Apply grounded idioms as constraints to workflow
 * @param idioms - Array of grounded idioms
 * @returns Workflow constraints object
 */
export function applyIdiomConstraints(idioms: IdiomMatch[]): {
  batch_mode?: boolean;
  approval_override?: boolean;
  urgency_level?: 'low' | 'medium' | 'high';
  defer?: boolean;
  relationship_flags?: string[];
} {
  const constraints: {
    batch_mode?: boolean;
    approval_override?: boolean;
    urgency_level?: 'low' | 'medium' | 'high';
    defer?: boolean;
    relationship_flags?: string[];
  } = {};

  for (const idiom of idioms) {
    switch (idiom.category) {
      case 'batch_mode':
        constraints.batch_mode = true;
        break;
      case 'approval':
        if (idiom.grounded.includes('approve_immediately')) {
          constraints.approval_override = true;
        }
        break;
      case 'urgency':
        if (idiom.grounded.includes('immediate') || idiom.grounded.includes('high')) {
          constraints.urgency_level = 'high';
        } else {
          constraints.urgency_level = 'medium';
        }
        break;
      case 'constraint':
        if (idiom.grounded.includes('defer')) {
          constraints.defer = true;
        }
        break;
      case 'relationship':
        if (!constraints.relationship_flags) {
          constraints.relationship_flags = [];
        }
        if (idiom.grounded.includes('trusted')) {
          constraints.relationship_flags.push('trusted_contact');
        }
        if (idiom.grounded.includes('high_risk')) {
          constraints.relationship_flags.push('high_risk_contact');
        }
        break;
    }
  }

  return constraints;
}

/**
 * Get human-readable explanation of grounded idioms
 * @param idioms - Array of detected idioms
 * @returns Explanation string for UI display
 */
export function explainIdioms(idioms: IdiomMatch[]): string {
  if (idioms.length === 0) {
    return 'No idioms detected.';
  }

  return idioms
    .map(idiom => `"${idiom.original}" → ${idiom.grounded}`)
    .join(' | ');
}
