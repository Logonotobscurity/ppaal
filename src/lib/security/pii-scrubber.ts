/**
 * @module PII Scrubbing Middleware
 * @description Detects and hashes personally identifiable information (PII)
 *              before storing voice transcripts or business data.
 * @pattern Service Layer Pattern
 */

import { createHash } from 'crypto';

/**
 * PII Types detected by the scrubber
 */
export enum PIITypes {
  PHONE = 'phone',
  EMAIL = 'email',
  BANK_ACCOUNT = 'bank_account',
  BVN = 'bvn', // Bank Verification Number (Nigeria)
  ADDRESS = 'address',
  NAME = 'name',
}

/**
 * Result of PII scanning
 */
export interface PIIScanResult {
  original: string;
  scrubbed: string;
  detected: Array<{
    type: PIITypes;
    value: string;
    hash: string;
    startIndex: number;
    endIndex: number;
  }>;
}

/**
 * Regex patterns for African-context PII detection
 */
const PATTERNS: Record<PIITypes, RegExp> = {
  [PIITypes.PHONE]: /(?:\+234|0)([789]\d{9})|(?:\+233|0)([5]\d{8})|(?:\+254|0)([7]\d{8})/g,
  [PIITypes.EMAIL]: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  [PIITypes.BANK_ACCOUNT]: /\b\d{10}\b/g,
  [PIITypes.BVN]: /\b\d{11}\b/g,
  [PIITypes.ADDRESS]: /\b(?:No\.?\s*\d+[A-Z]?|[A-Z][a-z]+\s+(?:Street|Road|Avenue|Lane|Drive|Court|Place|Way|Boulevard))\b/gi,
  [PIITypes.NAME]: /\b(?:[A-Z][a-z]+\s+[A-Z][a-z]+)\b/g,
};

/**
 * Hash a value using SHA-256 (truncated for readability)
 */
function hashValue(value: string): string {
  return createHash('sha256').update(value).digest('hex').slice(0, 16);
}

/**
 * Scan text for PII and return scrubbed version with metadata
 */
export function scanAndScrubPII(text: string): PIIScanResult {
  const detected: PIIScanResult['detected'] = [];
  let scrubbed = text;

  // Scan for each PII type
  Object.entries(PATTERNS).forEach(([type, pattern]) => {
    const matches = [...text.matchAll(pattern)];
    
    matches.forEach((match) => {
      const value = match[0];
      const startIndex = match.index!;
      const endIndex = startIndex + value.length;

      // Avoid duplicates (e.g., phone number also matching as digits)
      const alreadyDetected = detected.some(
        (d) => d.startIndex === startIndex && d.endIndex === endIndex
      );

      if (!alreadyDetected) {
        const hash = hashValue(value);
        detected.push({
          type: type as PIITypes,
          value,
          hash,
          startIndex,
          endIndex,
        });

        // Replace with placeholder in scrubbed text
        scrubbed = scrubbed.replace(value, `[${type.toUpperCase()}_REDACTED]`);
      }
    });
  });

  // Sort by position for consistent ordering
  detected.sort((a, b) => a.startIndex - b.startIndex);

  return {
    original: text,
    scrubbed,
    detected,
  };
}

/**
 * Middleware function to scrub PII from voice transcripts
 * before persisting to database
 */
export async function piiScrubMiddleware(
  transcript: string,
  workspaceId: string
): Promise<{
  safeTranscript: string;
  piiMetadata: {
    workspace_id: string;
    session_id: string;
    detected_count: number;
    types_found: PIITypes[];
  };
}> {
  const result = scanAndScrubPII(transcript);
  const sessionId = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

  // Log PII detection to secure audit table (not shown in response)
  // await supabase.from('pii_audit_log').insert({ ... })

  return {
    safeTranscript: result.scrubbed,
    piiMetadata: {
      workspace_id: workspaceId,
      session_id: sessionId,
      detected_count: result.detected.length,
      types_found: [...new Set(result.detected.map((d) => d.type))],
    },
  };
}

/**
 * Validate that a string contains no unredacted PII
 * Returns true if safe to store/display
 */
export function isPIISafe(text: string): boolean {
  const result = scanAndScrubPII(text);
  return result.detected.length === 0;
}

/**
 * Get PII statistics for compliance reporting
 */
export function getPIIStats(detected: PIIScanResult['detected']) {
  const stats = {
    total: detected.length,
    byType: {} as Record<PIITypes, number>,
    highRisk: 0, // Phone, Email, BVN, Bank Account
  };

  detected.forEach((item) => {
    stats.byType[item.type] = (stats.byType[item.type] || 0) + 1;
    
    if (
      item.type === PIITypes.PHONE ||
      item.type === PIITypes.EMAIL ||
      item.type === PIITypes.BVN ||
      item.type === PIITypes.BANK_ACCOUNT
    ) {
      stats.highRisk++;
    }
  });

  return stats;
}
