import type { ExchangeSnapshot } from '../entities/exchange-snapshot';

export interface ExchangeRatesProviderPort {
  getExchangeSnapshot(baseCurrency: string): Promise<ExchangeSnapshot>;
}
