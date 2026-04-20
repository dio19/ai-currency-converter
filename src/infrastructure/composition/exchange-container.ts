import { createGetExchangeSnapshot } from '../../domain/use-cases/get-exchange-snapshot';
import type { LoggerPort } from '../../domain/ports/logger-port';
import { logger } from '../adapters/console-logger';
import { VatComplyExchangeRatesProvider } from '../adapters/vatcomply-exchange-rates-provider';
import { ZodSchemaValidator } from '../adapters/zod-schema-validator';

export function createExchangeContainer(
  fetcher: typeof fetch = fetch,
  loggerPort: LoggerPort = logger
) {
  const schemaValidator = new ZodSchemaValidator();
  const exchangeRatesProvider = new VatComplyExchangeRatesProvider({
    fetcher,
    schemaValidator,
  });

  return {
    logger: loggerPort,
    schemaValidator,
    exchangeRatesProvider,
    getExchangeSnapshot: createGetExchangeSnapshot({
      exchangeRatesProvider,
      logger: loggerPort,
    }),
  };
}

export const exchangeContainer = createExchangeContainer();
