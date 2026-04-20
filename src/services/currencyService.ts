import { createExchangeContainer } from '../infrastructure/composition/exchange-container';
import {
  ExchangeResponseSchema,
  type ExchangeResponse,
} from '../infrastructure/contracts/exchange-api';
import { nullLogger } from '../infrastructure/adapters/null-logger';

/**
 * Application-facing service kept as a stable facade for route handlers and tests.
 * The orchestration now lives in the domain use case plus infrastructure adapters.
 */
export const currencyService = {
  async getExchangeRates(base: string = 'USD'): Promise<ExchangeResponse> {
    const container = createExchangeContainer(fetch);
    const snapshot = await container.getExchangeSnapshot({ baseCurrency: base });

    return ExchangeResponseSchema.parse(snapshot) as ExchangeResponse;
  },

  async getExchangeRatesBestEffort(base: string = 'USD'): Promise<ExchangeResponse | null> {
    try {
      const container = createExchangeContainer(fetch, nullLogger);
      const snapshot = await container.getExchangeSnapshot({ baseCurrency: base });

      return ExchangeResponseSchema.parse(snapshot) as ExchangeResponse;
    } catch {
      return null;
    }
  },
};
