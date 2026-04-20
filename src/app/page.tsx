import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query';
import CurrencyConverterApp from '../components/CurrencyConverterApp';
import { getExchangeQueryKey } from '../lib/exchange-query';
import { currencyService } from '../services/currencyService';

/**
 * Main Entry Point
 */
export default async function Home() {
  const queryClient = new QueryClient();

  const initialExchangeRates = await currencyService.getExchangeRatesBestEffort('USD');

  if (initialExchangeRates) {
    queryClient.setQueryData(getExchangeQueryKey('USD'), initialExchangeRates);
  }

  return (
    <main>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <CurrencyConverterApp />
      </HydrationBoundary>
    </main>
  );
}
