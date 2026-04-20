# AI Context: Currency Converter

Este archivo es la referencia operativa para agentes de IA que trabajen en este repositorio.

## Objetivo del sistema

La app convierte montos entre monedas usando tasas obtenidas desde VatComply. El sistema está diseñado para:

- aislar reglas de negocio del framework
- validar contratos externos de forma estricta
- producir errores RFC 7807 legibles por humanos y máquinas
- mantener una UI accesible y resiliente

## Capas autorizadas

### `src/domain/`

Código puro. No importar React, Next.js, Zod ni adapters concretos.

- `entities/exchange-snapshot.ts`
  - `CurrencyRate`
  - `ExchangeSnapshot`
- `ports/exchange-rates-provider.ts`
  - interfaz del proveedor de tasas
- `ports/logger-port.ts`
  - interfaz de logging
- `use-cases/convert-currency.ts`
  - cálculo puro del monto convertido y tasas derivadas
- `use-cases/get-exchange-snapshot.ts`
  - orquestación del snapshot a través de puertos

### `src/infrastructure/`

Implementaciones concretas y contratos de integración.

- `contracts/vatcomply.ts`
  - schemas Zod para respuestas del upstream
- `contracts/exchange-api.ts`
  - schema query `base`
  - schema de respuesta pública `{ base, timestamp, rates }`
  - schema de `Problem Details`
- `adapters/vatcomply-exchange-rates-provider.ts`
  - implementación concreta del puerto de tasas
- `adapters/zod-schema-validator.ts`
  - adapter mínimo para validación
- `adapters/console-logger.ts`
  - logger estructurado
- `composition/exchange-container.ts`
  - composition root para inyección de dependencias

### `src/shared/`

- `errors/application-error.ts`
  - jerarquía de errores de aplicación
  - serialización RFC 7807

### `src/services/`

Fachadas estables para el resto del repo.

- `currencyService.ts`
  - expone `getExchangeRates(base)`
  - delega al composition root y devuelve el contrato HTTP normalizado

### `src/app/actions/`

Server-side functions for orchestration and data fetching.

- `exchange-actions.ts`
  - `getExchangeRatesAction(base)`
  - valida input y delega a `currencyService`

### `src/app/api/`

Delivery layer Next.js.

- `api/exchange/route.ts`
  - valida query params
  - llama al servicio
  - responde JSON estable

### `src/hooks/` y `src/components/`

Cliente React.

- `useCurrencyConverter.ts`
  - estado UI + React Query + `marketStatus` semántico + parse de problemas HTTP
- `CurrencyConverterApp.tsx`
  - composición visual
- `ConverterForm.tsx`
  - controles accesibles
- `ConversionResult.tsx`
  - loading, success y error con regiones anunciables

## Contratos estables

### Request

`GET /api/exchange?base=USD`

- `base`: string ISO de 3 letras
- default: `USD`

### Response

```json
{
  "base": "USD",
  "timestamp": "2025-08-08",
  "rates": [
    {
      "code": "EUR",
      "rate": 0.85,
      "name": "Euro",
      "symbol": "€"
    }
  ]
}
```

### Error Response

```json
{
  "type": "https://app.currency-converter.com/errors/internal_server_error",
  "title": "Internal Server Error",
  "status": 500,
  "detail": "Database down",
  "instance": "/api/exchange",
  "code": "INTERNAL_SERVER_ERROR",
  "severity": "error"
}
```

## Flujo real de ejecución

1. `src/app/page.tsx` obtiene en servidor el snapshot inicial de `USD`.
2. Ese snapshot se hidrata al cliente con React Query para evitar un arranque completamente client-driven.
3. `useCurrencyConverter` reutiliza ese dato inicial y llama a `getExchangeRatesAction(from)` (Server Action) cuando cambia la moneda base.
4. La Server Action valida la moneda base, llama al servicio y devuelve el objeto tipado.
5. `currencyService` crea el container de dependencias.
6. `createGetExchangeSnapshot` invoca el puerto `ExchangeRatesProviderPort`.
7. `VatComplyExchangeRatesProvider` consulta endpoints de VatComply.
8. El adapter valida respuestas con `ExternalRatesSchema` y `ExternalCurrenciesSchema`.
9. El servicio devuelve un snapshot normalizado.
10. El hook calcula la cotización final con `convertCurrency`.
11. Si algo falla, `withErrorHandler` transforma la excepción en `application/problem+json`.

## Invariantes que no conviene romper

- El dominio no debe importar framework code.
- El hook no debe recalcular reglas de negocio ad hoc fuera del dominio.
- La hidratación inicial server-first usa la misma query key compartida que el cliente.
- El contrato HTTP público usa `timestamp`, no `date`.
- Todos los errores de API deben pasar por `withErrorHandler`.
- Si se agrega un proveedor nuevo, implementar otro adapter; no mutar el dominio.
- Si cambia el contrato del upstream, primero ajustar schemas en `src/infrastructure/contracts/`.

## Testing expectations

- `npm run type-check`
- `npm run test:unit`

Los tests actuales cubren:

- servicio y provider con `fetch` mockeado
- hook/component integration sobre `/api/exchange`
- errores RFC 7807
- logger estructurado
- utilidades de formato y cálculo

## DX rules para agentes

- Preferir tocar `domain` antes que duplicar lógica en `hooks` o `components`.
- Si cambias un contrato, actualiza tests y esta documentación en el mismo cambio.
- Evitar `any`; cuando TypeScript no pueda inferir bien por Zod, usar tipos explícitos o wrappers tipados.
- Mantener `src/lib/*` como fachadas compatibles mientras sigan siendo usadas por el repo.

<!-- AI-CONTEXT:GENERATED START -->

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

<!-- AI-CONTEXT:GENERATED END -->
