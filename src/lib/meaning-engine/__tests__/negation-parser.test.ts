/**
 * @tests negation-parser
 * @description Unit tests for African code-switched negation detection
 */

import { describe, it, expect } from 'vitest';
import { parseNegations, calculateNegationScore, explainNegations } from '../negation-parser';

describe('negation-parser', () => {
  describe('parseNegations', () => {
    it('should detect Pidgin verbatim negation "no send"', () => {
      const result = parseNegations('I no send am o');
      expect(result).toHaveLength(1);
      expect(result[0].phrase).toBe('no send');
      expect(result[0].type).toBe('verbatim');
      expect(result[0].confidence).toBe(0.95);
    });

    it('should detect Pidgin verbatim negation "ma se"', () => {
      const result = parseNegations('Ma se, I no fit come');
      expect(result.some(r => r.phrase === 'ma se')).toBe(true);
    });

    it('should detect English verbatim negation "don\'t send"', () => {
      const result = parseNegations("I don't send money");
      expect(result.some(r => r.phrase.includes("don't"))).toBe(true);
    });

    it('should detect fuzzy negation "wait"', () => {
      const result = parseNegations('Wait, make I check');
      expect(result.some(r => r.phrase === 'wait')).toBe(true);
      expect(result.find(r => r.phrase === 'wait')?.type).toBe('fuzzy');
    });

    it('should detect fuzzy negation "abi"', () => {
      const result = parseNegations('You go send am abi?');
      expect(result.some(r => r.phrase === 'abi')).toBe(true);
    });

    it('should return empty array for transcript without negations', () => {
      const result = parseNegations('I will send the money tomorrow');
      expect(result).toHaveLength(0);
    });

    it('should handle empty transcript', () => {
      const result = parseNegations('');
      expect(result).toHaveLength(0);
    });

    it('should detect multiple negations in one transcript', () => {
      const result = parseNegations('No send am, wait, make I check');
      expect(result.length).toBeGreaterThanOrEqual(2);
    });

    it('should sort by confidence (verbatim first)', () => {
      const result = parseNegations('Wait, no send am');
      expect(result[0].type).toBe('verbatim');
      expect(result[0].confidence).toBeGreaterThan(result[1]?.confidence || 0);
    });
  });

  describe('calculateNegationScore', () => {
    it('should return 0 for no negations', () => {
      const score = calculateNegationScore([]);
      expect(score).toBe(0);
    });

    it('should calculate score for one verbatim negation', () => {
      const negations = parseNegations('No send am');
      const score = calculateNegationScore(negations);
      expect(score).toBe(1.5); // 1 verbatim * 1.5
    });

    it('should cap verbatim score at 3.0', () => {
      const negations = [
        { phrase: 'no send', confidence: 0.95, start_index: 0, end_index: 7, type: 'verbatim' as const },
        { phrase: 'ma se', confidence: 0.95, start_index: 8, end_index: 13, type: 'verbatim' as const },
        { phrase: 'no fit', confidence: 0.95, start_index: 14, end_index: 20, type: 'verbatim' as const },
      ];
      const score = calculateNegationScore(negations);
      expect(score).toBe(3.0); // Capped at max
    });

    it('should calculate mixed verbatim and fuzzy score', () => {
      const negations = [
        { phrase: 'no send', confidence: 0.95, start_index: 0, end_index: 7, type: 'verbatim' as const },
        { phrase: 'wait', confidence: 0.65, start_index: 8, end_index: 12, type: 'fuzzy' as const },
      ];
      const score = calculateNegationScore(negations);
      expect(score).toBe(1.8); // 1.5 + 0.3
    });

    it('should cap total score at 3.0', () => {
      const negations = Array(5).fill({
        phrase: 'no send',
        confidence: 0.95,
        start_index: 0,
        end_index: 7,
        type: 'verbatim' as const,
      });
      const score = calculateNegationScore(negations);
      expect(score).toBe(3.0);
    });
  });

  describe('explainNegations', () => {
    it('should return message for no negations', () => {
      const explanation = explainNegations([]);
      expect(explanation).toBe('No negations detected.');
    });

    it('should explain verbatim negation', () => {
      const negations = [{ phrase: 'no send', confidence: 0.95, start_index: 0, end_index: 7, type: 'verbatim' as const }];
      const explanation = explainNegations(negations);
      expect(explanation).toContain('⚠️ Strong negation detected');
      expect(explanation).toContain('"no send"');
    });

    it('should explain fuzzy negation', () => {
      const negations = [{ phrase: 'wait', confidence: 0.65, start_index: 0, end_index: 4, type: 'fuzzy' as const }];
      const explanation = explainNegations(negations);
      expect(explanation).toContain('❓ Hesitation detected');
      expect(explanation).toContain('"wait"');
    });

    it('should explain multiple negations', () => {
      const negations = [
        { phrase: 'no send', confidence: 0.95, start_index: 0, end_index: 7, type: 'verbatim' as const },
        { phrase: 'wait', confidence: 0.65, start_index: 8, end_index: 12, type: 'fuzzy' as const },
      ];
      const explanation = explainNegations(negations);
      expect(explanation).toContain('⚠️');
      expect(explanation).toContain('❓');
      expect(explanation).toContain('|');
    });
  });
});
