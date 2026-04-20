'use server';

import { currencyService } from '../../services/currencyService';
import { 
  ExchangeResponseSchema, 
  ExchangeQuerySchema,
  type ExchangeResponse 
} from '../../infrastructure/contracts/exchange-api';

/**
 * Server Action to fetch exchange rates.
 * Moves fetching logic to the server, reducing client-side fetch footprint.
 */
export async function getExchangeRatesAction(baseCurrency: string = 'USD'): Promise<ExchangeResponse> {
  // Validate input
  const { base } = ExchangeQuerySchema.parse({ base: baseCurrency });
  
  // Use the established service layer
  const snapshot = await currencyService.getExchangeRates(base);
  
  // Ensure we return a clean, validated object
  return ExchangeResponseSchema.parse(snapshot) as ExchangeResponse;
}
