import { render, screen } from '@testing-library/react';
import Page from './page';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';

vi.mock('@tanstack/react-query', async () => {
  const actual =
    await vi.importActual<typeof import('@tanstack/react-query')>('@tanstack/react-query');

  return {
    ...actual,
    HydrationBoundary: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

vi.mock('../services/currencyService', () => ({
  currencyService: {
    getExchangeRatesBestEffort: vi.fn().mockResolvedValue({
      base: 'USD',
      timestamp: '2026-04-19T00:00:00.000Z',
      rates: [
        { code: 'USD', rate: 1, name: 'US Dollar', symbol: '$' },
        { code: 'EUR', rate: 0.92, name: 'Euro', symbol: 'EUR' },
      ],
    }),
  },
}));

// Mock the main app component to isolate the page smoke test
vi.mock('../components/CurrencyConverterApp', () => ({
  default: () => <div data-testid="main-app">Main App</div>,
}));

describe('Root Page', () => {
  it('renders the CurrencyConverterApp', async () => {
    render(await Page());
    expect(screen.getByTestId('main-app')).toBeInTheDocument();
  });
});
