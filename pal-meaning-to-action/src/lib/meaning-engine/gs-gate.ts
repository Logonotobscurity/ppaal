/**
 * Safeguard Gate (Gs)
 * 
 * Layer 2 of the PAL architecture.
 * Risk scoring system that gates DO mode actions.
 * 
 * Formula: Gs = 1.5·g_neg + 1.2·g_amt + 1.0·g_ch + 1.0·g_drift + 1.1·g_health
 * 
 * Thresholds:
 * - < 3.0: Auto-execute
 * - >= 3.0: Requires approval
 * - >= 5.0: Verbal confirmation required
 * - >= 7.0: Blocked completely
 */

import { z } from 'zod';
import type { CMEResult } from './cme';

/**
 * Gs gate calculation result
 */
export interface GsResult {
  score: number;
  breakdown: GsBreakdown;
  level: GsLevel;
  requiresApproval: boolean;
  requiresVerbalConfirm: boolean;
  isBlocked: boolean;
  factors: string[];
}

/**
 * Individual risk factor scores (0-1 each)
 */
export interface GsBreakdown {
  g_neg: number; // Negation risk
  g_amt: number; // Amount risk
  g_ch: number; // Channel risk
  g_drift: number; // Behavioral drift
  g_health: number; // Entity health
}

/**
 * Risk level classification
 */
export type GsLevel = 'low' | 'medium' | 'high' | 'blocked';

/**
 * Input context for Gs calculation
 */
export interface GsContext {
  cmeResult?: CMEResult;
  amount?: number;
  currency?: string;
  channel?: 'whatsapp' | 'sms' | 'voice' | 'app';
  historicalBehavior?: HistoricalBehavior;
  entityHealth?: EntityHealth;
}

/**
 * Historical behavior patterns
 */
export interface HistoricalBehavior {
  avgTransactionAmount: number;
  transactionCount: number;
  lastTransactionDate: string;
  failureRate: number;
  typicalChannels: string[];
}

/**
 * Entity health indicators
 */
export interface EntityHealth {
  paymentSuccessRate: number;
  disputeCount: number;
  daysSinceLastPayment: number;
  creditScore?: number;
}

/**
 * Zod schema for Gs result validation
 */
export const GsResultSchema = z.object({
  score: z.number().min(0),
  breakdown: z.object({
    g_neg: z.number().min(0).max(1),
    g_amt: z.number().min(0).max(1),
    g_ch: z.number().min(0).max(1),
    g_drift: z.number().min(0).max(1),
    g_health: z.number().min(0).max(1),
  }),
  level: z.enum(['low', 'medium', 'high', 'blocked']),
  requiresApproval: z.boolean(),
  requiresVerbalConfirm: z.boolean(),
  isBlocked: z.boolean(),
  factors: z.array(z.string()),
});

/**
 * Gs coefficient weights from spec
 */
const GS_WEIGHTS = {
  g_neg: 1.5,
  g_amt: 1.2,
  g_ch: 1.0,
  g_drift: 1.0,
  g_health: 1.1,
};

/**
 * Maximum possible Gs score (for normalization)
 */
const MAX_GS_SCORE =
  GS_WEIGHTS.g_neg * 1 +
  GS_WEIGHTS.g_amt * 1 +
  GS_WEIGHTS.g_ch * 1 +
  GS_WEIGHTS.g_drift * 1 +
  GS_WEIGHTS.g_health * 1;

/**
 * Calculate Gs risk score
 * 
 * @param context - Context including CME result, amount, channel, history
 * @returns Gs result with score, breakdown, and action flags
 * 
 * @example
 * ```typescript
 * const result = calculateGsScore({
 *   cmeResult: { negations: [...], ... },
 *   amount: 50000,
 *   currency: 'NGN',
 *   channel: 'voice',
 * });
 * 
 * if (result.requiresApproval) {
 *   // Route to approval queue
 * }
 * ```
 */
export function calculateGsScore(context: GsContext): GsResult {
  // Calculate individual risk factors
  const g_neg = calculateNegationRisk(context.cmeResult);
  const g_amt = calculateAmountRisk(context.amount, context.currency, context.historicalBehavior);
  const g_ch = calculateChannelRisk(context.channel);
  const g_drift = calculateDriftRisk(context.amount, context.historicalBehavior);
  const g_health = calculateHealthRisk(context.entityHealth);

  // Apply weighted formula
  const rawScore =
    GS_WEIGHTS.g_neg * g_neg +
    GS_WEIGHTS.g_amt * g_amt +
    GS_WEIGHTS.g_ch * g_ch +
    GS_WEIGHTS.g_drift * g_drift +
    GS_WEIGHTS.g_health * g_health;

  // Normalize to 0-10 scale
  const score = Math.round((rawScore / MAX_GS_SCORE) * 10 * 10) / 10;

  // Determine level and flags
  const level = determineLevel(score);
  const requiresApproval = score >= 3.0;
  const requiresVerbalConfirm = score >= 5.0;
  const isBlocked = score >= 7.0;

  // Generate human-readable factors
  const factors = generateFactors({ g_neg, g_amt, g_ch, g_drift, g_health });

  return {
    score,
    breakdown: { g_neg, g_amt, g_ch, g_drift, g_health },
    level,
    requiresApproval,
    requiresVerbalConfirm,
    isBlocked,
    factors,
  };
}

/**
 * Calculate negation risk from CME result
 */
function calculateNegationRisk(cmeResult?: CMEResult): number {
  if (!cmeResult) return 0;

  const hardNegations = cmeResult.negations.filter((n) => n.type === 'hard').length;
  const softNegations = cmeResult.negations.filter((n) => n.type === 'soft').length;

  // Hard negations are critical (0.8-1.0)
  if (hardNegations > 0) {
    return Math.min(1, 0.8 + hardNegations * 0.1);
  }

  // Soft negations add moderate risk (0.2-0.5)
  if (softNegations > 0) {
    return Math.min(0.5, 0.2 + softNegations * 0.1);
  }

  return 0;
}

/**
 * Calculate amount risk based on transaction size
 */
function calculateAmountRisk(
  amount?: number,
  currency?: string,
  history?: HistoricalBehavior
): number {
  if (!amount || amount <= 0) return 0;

  // Normalize amount (assuming NGN, adjust for other currencies)
  const normalizedAmount = currency === 'USD' ? amount * 1500 : amount;

  // Base risk increases logarithmically with amount
  let risk = Math.log10(normalizedAmount) / 7; // Cap at ~10M NGN

  // Adjust for deviation from historical average
  if (history?.avgTransactionAmount && history.avgTransactionAmount > 0) {
    const deviation = normalizedAmount / history.avgTransactionAmount;
    if (deviation > 3) {
      risk += 0.3; // 3x normal amount
    } else if (deviation > 10) {
      risk += 0.5; // 10x normal amount
    }
  }

  return Math.min(1, risk);
}

/**
 * Calculate channel risk
 */
function calculateChannelRisk(channel?: GsContext['channel']): number {
  switch (channel) {
    case 'voice':
      return 0.3; // Voice has higher uncertainty
    case 'sms':
      return 0.4; // SMS can be ambiguous
    case 'whatsapp':
      return 0.2; // WhatsApp has some context
    case 'app':
      return 0.1; // App has most context
    default:
      return 0.2;
  }
}

/**
 * Calculate behavioral drift risk
 */
function calculateDriftRisk(amount?: number, history?: HistoricalBehavior): number {
  if (!history || !amount) return 0.2; // Default moderate risk for unknown

  let risk = 0;

  // Check transaction frequency deviation
  const daysSinceLast = history.lastTransactionDate
    ? (Date.now() - new Date(history.lastTransactionDate).getTime()) / (1000 * 60 * 60 * 24)
    : 30;

  if (daysSinceLast > 90) {
    risk += 0.3; // Inactive user
  }

  // Check amount deviation
  if (history.avgTransactionAmount > 0) {
    const ratio = amount / history.avgTransactionAmount;
    if (ratio > 5 || ratio < 0.2) {
      risk += 0.4; // Unusual amount
    }
  }

  // Check channel deviation
  if (history.typicalChannels && history.typicalChannels.length > 0) {
    // Would need current channel here, simplified for now
  }

  return Math.min(1, risk);
}

/**
 * Calculate entity health risk
 */
function calculateHealthRisk(health?: EntityHealth): number {
  if (!health) return 0.3; // Default moderate risk for unknown

  let risk = 0;

  // Payment success rate
  if (health.paymentSuccessRate < 0.7) {
    risk += 0.4;
  } else if (health.paymentSuccessRate < 0.9) {
    risk += 0.2;
  }

  // Dispute count
  if (health.disputeCount > 5) {
    risk += 0.3;
  } else if (health.disputeCount > 2) {
    risk += 0.1;
  }

  // Days since last payment
  if (health.daysSinceLastPayment > 60) {
    risk += 0.2;
  }

  // Credit score if available
  if (health.creditScore && health.creditScore < 600) {
    risk += 0.3;
  }

  return Math.min(1, risk);
}

/**
 * Determine risk level from score
 */
function determineLevel(score: number): GsLevel {
  if (score >= 7.0) return 'blocked';
  if (score >= 5.0) return 'high';
  if (score >= 3.0) return 'medium';
  return 'low';
}

/**
 * Generate human-readable risk factors
 */
function generateFactors(breakdown: GsBreakdown): string[] {
  const factors: string[] = [];

  if (breakdown.g_neg >= 0.5) {
    factors.push('Negation detected in speech');
  }
  if (breakdown.g_amt >= 0.5) {
    factors.push('Unusually high transaction amount');
  }
  if (breakdown.g_ch >= 0.3) {
    factors.push('Higher-risk communication channel');
  }
  if (breakdown.g_drift >= 0.4) {
    factors.push('Behavioral pattern deviation');
  }
  if (breakdown.g_health >= 0.4) {
    factors.push('Entity health concerns');
  }

  return factors;
}

/**
 * Get risk color for UI display
 */
export function getRiskColor(level: GsLevel): string {
  switch (level) {
    case 'low':
      return 'bg-teal-500 text-white';
    case 'medium':
      return 'bg-amber-500 text-white';
    case 'high':
      return 'bg-orange-500 text-white';
    case 'blocked':
      return 'bg-red-500 text-white';
    default:
      return 'bg-gray-500 text-white';
  }
}

/**
 * Get risk icon for UI display
 */
export function getRiskIcon(level: GsLevel): string {
  switch (level) {
    case 'low':
      return '✅';
    case 'medium':
      return '⚠️';
    case 'high':
      return '🚨';
    case 'blocked':
      return '🛑';
    default:
      return '❓';
  }
}
