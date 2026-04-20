# Reference Principles

## Core

- El dominio no debe importar `react`, `next/*`, `zod`, `motion/react` ni adapters concretos.
- La lógica de negocio vive en `src/domain/`, no en `src/components/`, `src/hooks/` ni `src/app/api/`.
- Los adapters resuelven integración; el dominio define intención.

## Contracts

- Toda integración externa debe validarse con Zod en el borde.
- Todo endpoint público debe exponer un contrato estable y explícito.
- No se deben duplicar tipos si ya pueden derivarse de contratos o entidades existentes.

## Delivery

- Los Route Handlers deben coordinar, no contener lógica de negocio central.
- La UI no debe “masticar” datos crudos del upstream.
- Los errores HTTP deben salir por el pipeline RFC 7807 común.

## AI-First

- `README.md` y `AI_CONTEXT.md` deben describir el estado real del código.
- Los cambios de arquitectura deben actualizar contexto y documentación en el mismo cambio.
- Las automatizaciones deben priorizar `report-only` o `safe-fix` antes de aplicar correcciones amplias.

## React 19 Modernization

- Antes de introducir boilerplate manual, evaluar APIs nativas de React 19 y App Router.
- Formularios con lógica compleja de submit son candidatos a Server Actions / `useActionState`.
- Fetching pesado o bloqueante es candidato a `Suspense`, streaming o `loading.tsx`.
