import { NextResponse } from 'next/server';
import { currencyService } from '../../../services/currencyService';
import { withErrorHandler } from '../../../lib/api-handler';
import { ExchangeQuerySchema } from '../../../infrastructure/contracts/exchange-api';

/**
 * BFF Route Handler for Exchange Rates
 * Orchestrated by currencyService
 */
export const GET = withErrorHandler(async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const { base } = ExchangeQuerySchema.parse({
    base: searchParams.get('base') ?? 'USD',
  });

  const data = await currencyService.getExchangeRates(base);
  
  return NextResponse.json(data);
});
