import { describe, it, expect, vi } from 'vitest';
import { convertCurrency } from '../domain/use-cases/convert-currency';
import { formatCurrency } from './currencyUtils';

describe('Currency Logic Utilities', () => {
  describe('convertCurrency', () => {
    const rates = [
      { code: 'EUR', rate: 0.85, name: 'Euro', symbol: '€' },
      { code: 'JPY', rate: 150, name: 'Japanese Yen', symbol: '¥' },
    ];

    it('calculates conversion correctly with positive rate', () => {
      expect(convertCurrency({ amount: 100, targetCurrency: 'EUR', rates }).convertedAmount).toBe(
        85
      );
    });

    it('returns 0 for negative input amounts', () => {
      expect(convertCurrency({ amount: -100, targetCurrency: 'EUR', rates }).convertedAmount).toBe(
        0
      );
    });

    it('handles zero amount correctly', () => {
      expect(convertCurrency({ amount: 0, targetCurrency: 'JPY', rates }).convertedAmount).toBe(0);
    });

    it('handles zero rate correctly', () => {
      expect(
        convertCurrency({
          amount: 100,
          targetCurrency: 'USD',
          rates: [{ code: 'USD', rate: 0, name: 'US Dollar', symbol: '$' }],
        }).convertedAmount
      ).toBe(0);
    });

    it('handles edge case: very large numbers', () => {
      expect(
        convertCurrency({
          amount: 1000000,
          targetCurrency: 'JPY',
          rates,
        }).convertedAmount
      ).toBe(150000000);
    });
  });

  describe('formatCurrency', () => {
    it('formats a decimal number with standard 2 decimal places minimum', () => {
      const result = formatCurrency(1234.5, 'USD');
      expect(result).toContain('1,234.50');
    });

    it('handles up to 6 decimal places for high precision', () => {
      const result = formatCurrency(1.1234567, 'USD');
      expect(result).toBe('1.123457'); // Rounds at 6th place
    });

    it('falls back to toFixed if Intl.NumberFormat throws', () => {
      const original = Intl.NumberFormat;
      const failingNumberFormat = vi.fn().mockImplementation(() => {
        throw new Error('Formatting failed');
      });
      const intlWithMutableNumberFormat = Intl as typeof Intl & {
        NumberFormat: typeof Intl.NumberFormat;
      };
      intlWithMutableNumberFormat.NumberFormat = failingNumberFormat as unknown as typeof Intl.NumberFormat;

      const result = formatCurrency(1.123456, 'USD');
      expect(result).toBe('1.123456');

      intlWithMutableNumberFormat.NumberFormat = original;
    });
  });
});
