/**
 * @module gs-gate
 * @description Safeguard Gate - Risk scoring engine for PAL actions
 * @pattern Service Layer Pattern
 * 
 * Gs Formula: 1.5·g_neg + 1.2·g_amt + 1.0·g_ch + 1.0·g_drift + 1.1·g_health
 * 
 * Thresholds:
 * - < 3.0: Auto-stage (no approval needed)
 * - ≥ 3.0: Forced draft (approval required)
 * - ≥ 5.0: Verbal confirmation required
 * - ≥ 7.0: Blocked (cannot proceed)
 */

import { NegationMatch } from './negation-parser';

export interface GsBreakdown {
  g_neg: number;      // Negation score (0-3)
  g_amt: number;      // Amount deviation score (0-3)
  g_ch: number;       // Channel risk score (0-2)
  g_drift: number;    // Behavioral drift score (0-3)
  g_health: number;   // Founder wellness score (0-3)
  total: number;
}

export interface GsResult {
  score: number;
  breakdown: GsBreakdown;
  threshold: 'auto_stage' | 'forced_draft' | 'verbal_confirm' | 'blocked';
  requires_approval: boolean;
  explanation: string;
}

export interface GsInput {
  negations: NegationMatch[];
  amount?: number;
  typical_amount?: number;
  channel: 'whatsapp' | 'sms' | 'voice' | 'in_person';
  behavioral_drift?: number; // 0-1 scale from historical patterns
  wellness_indicators?: Array<'stressed' | 'rushed' | 'confused' | 'fatigued'>;
  idiom_constraints?: ReturnType<typeof import('./idiom-grounding').applyIdiomConstraints>;
}

/**
 * Calculate amount deviation score
 * @param amount - Current transaction amount
 * @param typicalAmount - User's typical transaction amount
 * @returns Score component (0-3 scale)
 */
function calculateAmountScore(amount?: number, typicalAmount?: number): number {
  if (!amount || !typicalAmount || typicalAmount === 0) {
    return 0;
  }

  const deviation = Math.abs(amount - typicalAmount) / typicalAmount;

  if (deviation > 2.0) return 3.0;      // >200% deviation
  if (deviation > 1.0) return 2.0;      // >100% deviation
  if (deviation > 0.5) return 1.0;      // >50% deviation
  return 0;
}

/**
 * Calculate channel risk score
 * @param channel - Communication channel
 * @returns Score component (0-2 scale)
 */
function calculateChannelScore(channel: GsInput['channel']): number {
  switch (channel) {
    case 'in_person':
      return 0;     // Lowest risk
    case 'voice':
      return 0.5;
    case 'whatsapp':
      return 1.0;
    case 'sms':
      return 1.5;   // Highest risk (no verification)
    default:
      return 1.0;
  }
}

/**
 * Calculate wellness/health score
 * @param indicators - Detected wellness indicators
 * @returns Score component (0-3 scale)
 */
function calculateWellnessScore(indicators?: GsInput['wellness_indicators']): number {
  if (!indicators || indicators.length === 0) {
    return 0;
  }

  const severityMap: Record<string, number> = {
    stressed: 0.8,
    rushed: 0.7,
    confused: 1.2,
    fatigued: 0.6,
  };

  const total = indicators.reduce((sum, ind) => sum + (severityMap[ind] || 0), 0);
  return Math.min(total, 3.0);
}

/**
 * Determine threshold category from total score
 * @param score - Total Gs score
 * @returns Threshold category
 */
function determineThreshold(score: number): GsResult['threshold'] {
  if (score >= 7.0) return 'blocked';
  if (score >= 5.0) return 'verbal_confirm';
  if (score >= 3.0) return 'forced_draft';
  return 'auto_stage';
}

/**
 * Generate human-readable explanation
 * @param breakdown - Gs breakdown scores
 * @param threshold - Threshold category
 * @returns Explanation string
 */
function generateExplanation(breakdown: GsBreakdown, threshold: GsResult['threshold']): string {
  const parts: string[] = [];

  if (breakdown.g_neg > 0) {
    parts.push(`Negation detected (+${breakdown.g_neg.toFixed(1)})`);
  }

  if (breakdown.g_amt > 0) {
    parts.push(`Amount deviation (+${breakdown.g_amt.toFixed(1)})`);
  }

  if (breakdown.g_ch > 0.5) {
    parts.push(`Channel risk (+${breakdown.g_ch.toFixed(1)})`);
  }

  if (breakdown.g_drift > 0) {
    parts.push(`Behavioral drift (+${breakdown.g_drift.toFixed(1)})`);
  }

  if (breakdown.g_health > 0) {
    parts.push(`Wellness concerns (+${breakdown.g_health.toFixed(1)})`);
  }

  if (parts.length === 0) {
    return 'Low risk - auto-approved.';
  }

  const action = {
    auto_stage: 'Action will proceed automatically.',
    forced_draft: 'Approval required before execution.',
    verbal_confirm: 'Verbal confirmation required.',
    blocked: 'Action blocked due to high risk.',
  }[threshold];

  return `${parts.join(' | ')} → ${action}`;
}

/**
 * Evaluate Gs Gate for an action
 * @param input - Gs input parameters
 * @param negationScoreFn - Optional custom negation score calculator
 * @returns Gs result with score, breakdown, and threshold
 */
export function evaluateGsGate(
  input: GsInput,
  negationScoreFn?: (negations: NegationMatch[]) => number
): GsResult {
  // Calculate individual components
  const g_neg = negationScoreFn
    ? negationScoreFn(input.negations)
    : Math.min(input.negations.filter(n => n.type === 'verbatim').length * 1.5, 3.0);

  const g_amt = calculateAmountScore(input.amount, input.typical_amount);
  const g_ch = calculateChannelScore(input.channel);
  const g_drift = Math.min((input.behavioral_drift || 0) * 3, 3.0);
  const g_health = calculateWellnessScore(input.wellness_indicators);

  // Apply idiom constraints (can reduce certain scores)
  if (input.idiom_constraints?.approval_override && g_amt > 0) {
    // "shenk am" overrides amount concerns
    // Still keep other risk factors
  }

  // Calculate weighted total using PAL formula
  const total =
    1.5 * g_neg +
    1.2 * g_amt +
    1.0 * g_ch +
    1.0 * g_drift +
    1.1 * g_health;

  const cappedTotal = Math.min(total, 10.0); // Cap at 10

  const breakdown: GsBreakdown = {
    g_neg,
    g_amt,
    g_ch,
    g_drift,
    g_health,
    total: cappedTotal,
  };

  const threshold = determineThreshold(cappedTotal);

  return {
    score: cappedTotal,
    breakdown,
    threshold,
    requires_approval: cappedTotal >= 3.0,
    explanation: generateExplanation(breakdown, threshold),
  };
}

/**
 * Check if action can proceed without approval
 * @param gsResult - Gs evaluation result
 * @returns True if action can auto-proceed
 */
export function canAutoProceed(gsResult: GsResult): boolean {
  return gsResult.threshold === 'auto_stage';
}

/**
 * Check if action is completely blocked
 * @param gsResult - Gs evaluation result
 * @returns True if action is blocked
 */
export function isBlocked(gsResult: GsResult): boolean {
  return gsResult.threshold === 'blocked';
}

/**
 * Get required confirmation level
 * @param gsResult - Gs evaluation result
 * @returns Required confirmation type
 */
export function getRequiredConfirmation(gsResult: GsResult): 'none' | 'written' | 'verbal' {
  switch (gsResult.threshold) {
    case 'blocked':
      return 'verbal'; // Actually blocked, but if override exists, needs verbal
    case 'verbal_confirm':
      return 'verbal';
    case 'forced_draft':
      return 'written';
    case 'auto_stage':
      return 'none';
  }
}
