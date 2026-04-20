# AI Context Snapshot

> Archivo generado para asistir la sincronización de `AI_CONTEXT.md` con el código real.

## Domain Inventory

- `src/domain/entities/exchange-snapshot.ts`
  - exports: CurrencyRate, ExchangeSnapshot
- `src/domain/ports/exchange-rates-provider.ts`
  - exports: ExchangeRatesProviderPort
- `src/domain/ports/logger-port.ts`
  - exports: LogContext, LoggerPort
- `src/domain/use-cases/convert-currency.ts`
  - exports: ConvertCurrencyInput, ConversionQuote, convertCurrency
- `src/domain/use-cases/get-exchange-snapshot.ts`
  - exports: createGetExchangeSnapshot

## Infrastructure Contracts

- `src/infrastructure/contracts/exchange-api.ts`
  - exports: ExchangeRate, ExchangeResponse, CurrencyCodeSchema, ExchangeRateSchema, ExchangeResponseSchema, ExchangeQuerySchema, ProblemDetailsSchema, ExchangeQuery, ProblemDetailsResponse
- `src/infrastructure/contracts/vatcomply.ts`
  - exports: ExternalRatesSchema, ExternalCurrenciesSchema, ExternalRates, ExternalCurrencies

## Infrastructure Adapters

- `src/infrastructure/adapters/console-logger.ts`
  - exports: logger
- `src/infrastructure/adapters/null-logger.ts`
  - exports: nullLogger
- `src/infrastructure/adapters/vatcomply-exchange-rates-provider.ts`
  - exports: VatComplyExchangeRatesProvider
- `src/infrastructure/adapters/zod-schema-validator.ts`
  - exports: ZodSchemaValidator

## Server Actions

- `src/app/actions/exchange-actions.ts`

## Delivery Endpoints

- `src/app/api/exchange/route.ts`
  - exports: GET
