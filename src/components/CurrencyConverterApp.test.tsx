import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import CurrencyConverterApp from './CurrencyConverterApp';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import React from 'react';

// Create a custom QueryClient for tests with retries disabled
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const ProvidersTest = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

// 1. Configure MSW (Mock Service Worker) to handle both internal BFF and external upstream
const server = setupServer(
  // Standard internal API
  http.get('/api/exchange', () => {
    return HttpResponse.json({
      base: 'USD',
      timestamp: '2025-08-08',
      rates: [
        { code: 'USD', rate: 1, name: 'US Dollar', symbol: '$' },
        { code: 'EUR', rate: 0.85, name: 'Euro', symbol: '€' }
      ]
    });
  }),
  // External Upstream (VatComply) - needed because Server Actions call this layer directly in tests
  http.get('https://api.vatcomply.com/rates', () => {
    return HttpResponse.json({
      date: '2025-08-08',
      base: 'USD',
      rates: { USD: 1, EUR: 0.85 }
    });
  }),
  http.get('https://api.vatcomply.com/currencies', () => {
    return HttpResponse.json({
      USD: { name: 'US Dollar', symbol: '$' },
      EUR: { name: 'Euro', symbol: '€' }
    });
  })
);

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('CurrencyConverter Integration', () => {
  it('shows loading state and then renders conversion result', async () => {
    render(
      <ProvidersTest>
        <CurrencyConverterApp />
      </ProvidersTest>
    );

    expect(screen.getByRole('spinbutton', { name: /^Amount$/i })).toBeInTheDocument();

    // Wait for the mock API response to be processed
    await waitFor(() => {
      // Find the specific result display row
      const results = screen.getAllByText(/US Dollar/i);
      // We expect it to be in the conversion result paragraph with the "=" sign
      const conversionRow = results.find(el => el.textContent?.includes('='));
      expect(conversionRow).toBeInTheDocument();
    }, { timeout: 3000 });

    // Use a more flexible matcher for the heading to avoid issues with formatting/spaces
    // level: 2 is for <h2>
    expect(screen.getByRole('heading', { level: 2, name: /0\.85/ })).toBeInTheDocument();
  });

  it('shows error state when API fails', async () => {
    // Intercept the upstream call to simulate failure
    server.use(
      http.get('https://api.vatcomply.com/rates', () => {
        return new HttpResponse(null, { status: 503 });
      })
    );

    render(
      <ProvidersTest>
        <CurrencyConverterApp />
      </ProvidersTest>
    );

    await waitFor(() => {
      // The alert role is assigned to the error message div in ConversionResult.tsx
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/VatComply is currently unavailable/i)).toBeInTheDocument();
    }, { timeout: 4000 });
  });

  it('allows swapping currencies', async () => {
    const { container } = render(
      <ProvidersTest>
        <CurrencyConverterApp />
      </ProvidersTest>
    );

    // Wait for data
    await waitFor(() => screen.getByText(/US Dollar =/i));

    const swapButton = container.querySelector('button[aria-label="Swap currencies"]');
    if (!swapButton) throw new Error('Swap button not found');

    // Click swap
    fireEvent.click(swapButton);

    // Verify it swapped (should show Euro = US Dollar now)
    await waitFor(() => {
      expect(screen.getByText(/Euro =/i)).toBeInTheDocument();
    });
  });

  it('allows changing current base currency', async () => {
    render(
      <ProvidersTest>
        <CurrencyConverterApp />
      </ProvidersTest>
    );

    // Wait for data
    await waitFor(() => screen.getByText(/US Dollar =/i));

    // Get the first selector (From)
    const selectors = screen.getAllByRole('combobox');
    
    // Change "From" to EUR
    fireEvent.change(selectors[0], { target: { value: 'EUR' } });

    // Verify it changed
    await waitFor(() => {
      expect(screen.getByText(/Euro =/i)).toBeInTheDocument();
    });
  });
});
