import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest';
import { currencyService } from './currencyService';
import { ExternalApiError } from '../lib/exceptions';

let mockFetch: MockInstance;

beforeEach(() => {
  mockFetch = vi.spyOn(global, 'fetch');
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('currencyService', () => {
  it('correctly orchestrates rates and currencies', async () => {
    mockFetch.mockImplementation(async (input) => {
      const url = String(input);

      if (url.includes('/rates')) {
        return Response.json({
          date: '2025-08-08',
          base: 'USD',
          rates: { EUR: 0.85, GBP: 0.72 },
        });
      }

      return Response.json({
        USD: { name: 'US Dollar', symbol: '$' },
        EUR: { name: 'Euro', symbol: '€' },
        GBP: { name: 'British Pound', symbol: '£' },
      });
    });

    const result = await currencyService.getExchangeRates('USD');

    expect(result.base).toBe('USD');
    expect(result.rates).toHaveLength(2); // EUR and GBP
    expect(result.timestamp).toBe('2025-08-08');

    const eur = result.rates.find((r) => r.code === 'EUR');
    expect(eur).toBeDefined();
    expect(eur?.name).toBe('Euro');
    expect(eur?.rate).toBe(0.85);
  });

  it('throws ExternalApiError when upstream provider fails', async () => {
    mockFetch.mockImplementation(async (input) => {
      const url = String(input);

      if (url.includes('/rates')) {
        return new Response(null, { status: 503 });
      }

      return Response.json({
        USD: { name: 'US Dollar', symbol: '$' },
      });
    });

    await expect(currencyService.getExchangeRates('USD')).rejects.toThrow(ExternalApiError);
  });

  it('handles unknown currencies by falling back to the code as name', async () => {
    mockFetch.mockImplementation(async (input) => {
      const url = String(input);

      if (url.includes('/rates')) {
        return Response.json({
          date: '2025-08-08',
          base: 'USD',
          rates: { WOW: 1.23 },
        });
      }

      return Response.json({
        USD: { name: 'US Dollar', symbol: '$' },
      });
    });

    const result = await currencyService.getExchangeRates('USD');
    const wow = result.rates.find((r) => r.code === 'WOW');
    expect(wow?.name).toBe('WOW');
  });

  it('returns null in best-effort mode when upstream provider fails', async () => {
    mockFetch.mockImplementation(async (input) => {
      const url = String(input);

      if (url.includes('/rates')) {
        throw new Error('network down');
      }

      return Response.json({
        USD: { name: 'US Dollar', symbol: '$' },
      });
    });

    await expect(currencyService.getExchangeRatesBestEffort('USD')).resolves.toBeNull();
  });
});
