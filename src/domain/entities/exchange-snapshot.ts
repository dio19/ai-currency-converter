export interface CurrencyRate {
  readonly code: string;
  readonly rate: number;
  readonly name: string;
  readonly symbol: string;
}

export interface ExchangeSnapshot {
  readonly base: string;
  readonly timestamp: string;
  readonly rates: readonly CurrencyRate[];
}
