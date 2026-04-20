# Currency Converter

Aplicación de conversión de divisas construida con Next.js App Router, React 19 y una arquitectura hexagonal pensada para resiliencia, DX y colaboración AI-first.

## Architecture & Decisions

### Estado actual del sistema

- El core está desacoplado del framework mediante capas explícitas:
  - `src/domain/`: entidades, puertos y use cases puros.
  - `src/infrastructure/`: adapters concretos para VatComply, Zod y logging.
  - `src/shared/`: errores de aplicación y serialización RFC 7807.
  - `src/services/`: fachadas estables para consumo interno.
  - `src/app/api/`: delivery HTTP con Route Handlers.
  - `src/hooks/` y `src/components/`: UI cliente y orquestación visual.
- La lógica de negocio no depende de React, Next.js ni Zod.
- El contrato público del BFF es estable y tipado: `{ base, timestamp, rates }`.
- Todos los errores de servidor se serializan como `application/problem+json` con `code`, `severity` e `instance`.
- El cliente usa TanStack Query para fetch, caché y persistencia local, mientras el cálculo de conversión vive en el dominio.
- La ruta principal ya combina render server-first con hidratación inicial de datos para bajar trabajo del primer render cliente.

### Decisiones técnicas vigentes

- **Arquitectura hexagonal**: los cambios de proveedor o de transporte deberían resolverse con nuevos adapters, no tocando el dominio.
- **Contract-first con Zod**: todo input/output externo se valida en los bordes antes de entrar al core.
- **Errores enterprise con RFC 7807**: el handler global `withErrorHandler` unifica fallos de validación, upstream y errores inesperados.
- **Logging estructurado**: el logger emite JSON con contexto, timestamp y error serializado para facilitar observabilidad y debugging asistido por IA.
- **Cliente animado con `motion/react`**: las animaciones de entrada, transiciones de cards y estados visuales usan `motion/react`, no CSS aislado ni lógica ad hoc.
- **Accesibilidad como requisito funcional**: labels semánticos, `aria-live`, `role="status"` y `role="alert"` están integrados en el flujo normal del producto.

## AI-First Engineering & Automation

El proyecto está diseñado para que humanos y agentes de IA colaboren sin fricción, protegiendo la arquitectura mediante automatización activa:

- **Documentación Viva**: `AI_CONTEXT.md` se sincroniza automáticamente con el código real mediante `npm run sync:ai-context`, manteniendo un inventario siempre veraz de entidades, puertos y contratos.
- **Vigilancia Arquitectónica**: `architecture-observer` audita los desvíos estructurales (ej: imports prohibidos desde el dominio hacia el framework) antes de integrar cambios.
- **Guardianes de Contrato**: `zod-contract-guardian` asegura que toda frontera externa esté protegida por validación explícita.
- **Modernización Proactiva**: El sistema genera reportes de modernización (`npm run report:react19`) para detectar cuándo patrones manuales pueden ser reemplazados por APIs nativas de React 19 o Next.js.
- **DX Asistida**: Las fachadas en `src/lib/*` y `src/services/*` reducen el costo cognitivo y facilitan la refactorización incremental por parte de agentes.

## Decisiones Técnicas Consolidadas

- **Arquitectura Hexagonal**: El motor del negocio (`src/domain/`) es independiente del framework; los cambios de proveedor o transporte se resuelven en `src/infrastructure/`.
- **BFF (Backend-for-Frontend)**: La capa de API en Next.js actúa como cocina de limpieza, entregando contratos estables y normalizados a la UI.
- **Contract-first con Zod**: Todo input/output externo se valida en los bordes.
- **Resiliencia Local**: Persistencia offline mediante TanStack Query y `PersistQueryClientProvider`.
- **Errores Estándar (RFC 7807)**: Fallos manejados mediante el handler `withErrorHandler` y serializados como `application/problem+json`.
- **UX Adaptativa**: Hidratación server-first en la ruta principal para minimizar el trabajo del cliente en el primer render.

## Data Flow

1. `src/app/page.tsx` precalienta el snapshot inicial de `USD` en servidor.
2. Ese snapshot se hidrata al cliente con `HydrationBoundary` para evitar un arranque 100% client-driven.
3. La UI usa `useCurrencyConverter` para manejar monto, monedas y estado async.
4. Cuando cambia la moneda base, el hook consulta `/api/exchange?base=...`.
5. El Route Handler valida la query con `ExchangeQuerySchema`.
6. `currencyService` delega al use case `createGetExchangeSnapshot`.
7. El use case llama al puerto `ExchangeRatesProviderPort`.
8. `VatComplyExchangeRatesProvider` obtiene datos de VatComply y valida contratos con Zod.
9. La respuesta vuelve normalizada como `ExchangeResponse` con `base`, `timestamp` y `rates`.
10. El cálculo final de conversión ocurre en el dominio con `convertCurrency`.

## Frontend Notes

### Cliente

- El estado interactivo local (`amount`, `from`, `to`) vive en React state.
- El estado remoto y la caché viven en TanStack Query.
- La persistencia offline usa `PersistQueryClientProvider` + `localStorage`.
- El estado visual de mercado se expresa con un `marketStatus` semántico en vez de coordinar flags sueltas.
- Las animaciones usan `motion/react` en:
  - cards
  - headers
  - transiciones de resultado/loading
  - error boundary global

### Servidor

- El endpoint principal es `GET /api/exchange`.
- La capa HTTP usa Route Handlers de Next.js.
- El provider externo actual es VatComply.
- El adaptador transforma respuestas externas a un shape estable para UI y tests.

## Stable Contracts

Respuesta HTTP de `/api/exchange`:

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

Errores HTTP:

- Formato `application/problem+json`
- Basado en RFC 7807
- Extendido con `code` y `severity`

## DX & Tooling

### TypeScript

- Path aliases: `@/* -> src/*`
- `tsc --noEmit` como validación principal de tipos
- Refactor reciente orientado a reducir `any` y hacer más explícitas las fronteras del sistema

### Linting y formato

- ESLint 9 usa flat config en [eslint.config.mjs](/Users/henry/currency-converter/eslint.config.mjs).
- Scripts disponibles:
  - `npm run lint`
  - `npm run lint:fix`
  - `npm run format`
- Prettier está integrado como formateador del repo.

### Git hooks y quality gates

Husky está configurado para endurecer calidad antes de integrar cambios:

- `pre-commit`
  - ejecuta `scripts/check-secrets.sh`
  - ejecuta `lint-staged`
  - ejecuta `npm run check:ai-first`
- `commit-msg`
  - ejecuta `commitlint`
- `pre-push`
  - ejecuta `npm audit --audit-level=critical`
  - ejecuta `npm run build`
  - ejecuta `npx size-limit`

## Scripts

### Desarrollo

- `npm run dev`: entorno local con Next.js.
- `npm run build`: build de producción.
- `npm run start`: arranque de producción.
- `npm run storybook`: catálogo visual local.
- `npm run build-storybook`: build estático de Storybook.

### Calidad

- `npm run lint`: ESLint con reglas de Next Core Web Vitals.
- `npm run lint:fix`: corrige automáticamente issues de lint cuando es posible.
- `npm run format`: formatea el repo con Prettier.
- `npm run type-check`: validación TypeScript.
- `npm run audit:architecture`: verifica fronteras de arquitectura.
- `npm run audit:contracts`: detecta contratos sin validación explícita.
- `npm run sync:ai-context`: regenera el snapshot operativo de `AI_CONTEXT.md`.
- `npm run check:ai-context`: falla si `AI_CONTEXT.md` quedó desincronizado.
- `npm run report:react19`: genera backlog heurístico de modernización.
- `npm run sync:ai-first`: sincroniza contexto AI y reporte React 19.
- `npm run check:ai-first`: corre guardrails AI-first consolidados.
- `npm run maintain:ai-first`: muestra tareas de mantenimiento AI-first.
- `npm run fix:ai-first`: aplica fixes seguros de mantenimiento AI-first.

### Testing

- `npm run test`: modo interactivo base de Vitest.
- `npm run test:unit`: suite unitaria/integración en modo run.
- `npm run test:coverage`: cobertura de Vitest.
- `npm run test:ui`: interfaz visual de Vitest.
- `npm run test:e2e`: suite Playwright.
- `npm run test:e2e:install`: instala navegadores de Playwright.
- `npm run test:e2e:report`: abre el reporte HTML de Playwright.

## Testing Strategy

- **Vitest** para unit e integration tests.
- **Testing Library** para comportamiento de componentes.
- **MSW** y mocks de `fetch` para controlar dependencias externas.
- **Playwright** para journeys end-to-end.
- **Storybook** para visual regression manual y pruebas de estados UI.

Cobertura actual esperada:

- dominio y utilidades
- errores RFC 7807
- servicio desacoplado y adapters
- integración del converter en cliente

## Accessibility & UX

- Inputs y selects etiquetados con `label`.
- Resultado de conversión y estados de carga/error anunciados con `aria-live`.
- El formulario guía al usuario con helper text y restringe montos negativos.
- El error global muestra referencia técnica (`digest`) para soporte.

## Repo Guidance

- Si cambiás un contrato, actualizá tests y `AI_CONTEXT.md`.
- Si agregás un proveedor nuevo, implementá otro adapter; no metas lógica del proveedor en el dominio.
- Si reintroducís Server Actions o streaming, documentalo aquí como decisión vigente y no como intención futura.
- Si una decisión deja de reflejar el código, este `README` debe cambiar en el mismo PR.
