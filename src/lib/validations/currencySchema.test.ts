import { describe, it, expect } from 'vitest';
import { ExternalRatesSchema, ExternalCurrenciesSchema } from './currencySchema';

describe('Currency Data Schema Validation', () => {
  it('should validate a correct Rates API response', () => {
    const validData = {
      date: '2025-08-08',
      base: 'USD',
      rates: {
        EUR: 0.85,
        GBP: 0.72
      }
    };
    expect(() => ExternalRatesSchema.parse(validData)).not.toThrow();
  });

  it('should reject Rates API response with missing fields', () => {
    const invalidData = {
      date: '2025-08-08',
      rates: { EUR: 0.85 }
    };
    expect(() => ExternalRatesSchema.parse(invalidData)).toThrow();
  });

  it('should validate complete Currencies API response', () => {
    const validData = {
      USD: { name: 'US Dollar', symbol: '$' },
      EUR: { name: 'Euro', symbol: '€' }
    };
    expect(() => ExternalCurrenciesSchema.parse(validData)).not.toThrow();
  });

  it('should reject malformed Currencies metadata', () => {
    const invalidData = {
      USD: { name: 'US Dollar' } // Missing symbol
    };
    expect(() => ExternalCurrenciesSchema.parse(invalidData)).toThrow();
  });
});
