import type { ExchangeSnapshot } from '../../domain/entities/exchange-snapshot';
import type { ExchangeRatesProviderPort } from '../../domain/ports/exchange-rates-provider';
import { ExternalDependencyError } from '../../shared/errors/application-error';
import {
  ExternalCurrenciesSchema,
  ExternalRatesSchema,
  type ExternalCurrencies,
  type ExternalRates,
} from '../contracts/vatcomply';
import { ZodSchemaValidator } from './zod-schema-validator';

interface VatComplyExchangeRatesProviderDependencies {
  fetcher: typeof fetch;
  schemaValidator: ZodSchemaValidator;
}

export class VatComplyExchangeRatesProvider implements ExchangeRatesProviderPort {
  private readonly ratesUrl = 'https://api.vatcomply.com/rates';
  private readonly currenciesUrl = 'https://api.vatcomply.com/currencies';

  constructor(private readonly dependencies: VatComplyExchangeRatesProviderDependencies) {}

  async getExchangeSnapshot(baseCurrency: string): Promise<ExchangeSnapshot> {
    const [ratesResponse, currenciesResponse] = await Promise.all([
      this.dependencies.fetcher(`${this.ratesUrl}?base=${baseCurrency}`, {
        next: { revalidate: 300 },
      }),
      this.dependencies.fetcher(this.currenciesUrl, {
        next: { revalidate: 3600 },
      }),
    ]);

    if (!ratesResponse.ok || !currenciesResponse.ok) {
      throw new ExternalDependencyError('VatComply is currently unavailable.', {
        provider: 'VatComply',
        baseCurrency,
        ratesStatus: ratesResponse.status,
        currenciesStatus: currenciesResponse.status,
      });
    }

    const [rawRates, rawCurrencies] = await Promise.all([
      ratesResponse.json(),
      currenciesResponse.json(),
    ]);

    const validatedRates = this.dependencies.schemaValidator.parse<ExternalRates>(
      ExternalRatesSchema,
      rawRates
    );
    const validatedCurrencies = this.dependencies.schemaValidator.parse(
      ExternalCurrenciesSchema,
      rawCurrencies
    ) as ExternalCurrencies;

    return {
      base: validatedRates.base,
      timestamp: validatedRates.date,
      rates: Object.entries(validatedRates.rates).map(([code, rate]) => ({
        code,
        rate,
        name: validatedCurrencies[code]?.name ?? code,
        symbol: validatedCurrencies[code]?.symbol ?? '',
      })),
    };
  }
}
