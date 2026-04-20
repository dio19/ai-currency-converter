import type { CurrencyRate } from '../entities/exchange-snapshot';

export interface ConvertCurrencyInput {
  amount: number;
  targetCurrency: string;
  rates: readonly CurrencyRate[];
}

export interface ConversionQuote {
  convertedAmount: number;
  exchangeRate: number;
  inverseRate: number;
}

export function convertCurrency({
  amount,
  targetCurrency,
  rates,
}: ConvertCurrencyInput): ConversionQuote {
  if (amount <= 0) {
    return {
      convertedAmount: 0,
      exchangeRate: 0,
      inverseRate: 0,
    };
  }

  const matchedRate = rates.find((rate) => rate.code === targetCurrency);

  if (!matchedRate || matchedRate.rate <= 0) {
    return {
      convertedAmount: 0,
      exchangeRate: 0,
      inverseRate: 0,
    };
  }

  return {
    convertedAmount: amount * matchedRate.rate,
    exchangeRate: matchedRate.rate,
    inverseRate: 1 / matchedRate.rate,
  };
}
