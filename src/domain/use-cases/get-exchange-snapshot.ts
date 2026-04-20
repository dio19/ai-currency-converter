import type { ExchangeSnapshot } from '../entities/exchange-snapshot';
import type { ExchangeRatesProviderPort } from '../ports/exchange-rates-provider';
import type { LoggerPort } from '../ports/logger-port';

interface GetExchangeSnapshotDependencies {
  exchangeRatesProvider: ExchangeRatesProviderPort;
  logger: LoggerPort;
}

interface GetExchangeSnapshotInput {
  baseCurrency?: string;
}

export function createGetExchangeSnapshot({
  exchangeRatesProvider,
  logger,
}: GetExchangeSnapshotDependencies) {
  return async function getExchangeSnapshot({
    baseCurrency = 'USD',
  }: GetExchangeSnapshotInput = {}): Promise<ExchangeSnapshot> {
    const normalizedBaseCurrency = baseCurrency.toUpperCase();

    logger.info('EXCHANGE_SNAPSHOT_REQUESTED', {
      baseCurrency: normalizedBaseCurrency,
    });

    try {
      const snapshot = await exchangeRatesProvider.getExchangeSnapshot(normalizedBaseCurrency);

      logger.debug('EXCHANGE_SNAPSHOT_RESOLVED', {
        baseCurrency: snapshot.base,
        ratesCount: snapshot.rates.length,
        timestamp: snapshot.timestamp,
      });

      return snapshot;
    } catch (error) {
      logger.error(
        'EXCHANGE_SNAPSHOT_FAILED',
        { baseCurrency: normalizedBaseCurrency },
        error instanceof Error ? error : undefined
      );

      throw error;
    }
  };
}
