# ROADMAP AI-FIRST

## Estado de esta etapa

Esta branch deja cerrada una primera etapa ejecutable del roadmap.

### Completado

- `architecture-observer` implementado como script operativo
- `zod-contract-guardian` implementado para revisar contratos en bordes
- `ai-context-sync` implementado con snapshot generado e inyección en `AI_CONTEXT.md`
- reporte de modernización React 19 implementado y conectado al flujo del repo
- comandos orquestadores AI-first agregados a `package.json`
- guardrails conectados a hooks locales
- `loading.tsx` agregado como primer paso concreto de streaming UX
- hidratación server-first inicial para exchange rates agregada en `src/app/page.tsx`
- simplificación del estado cliente hacia `marketStatus`
- persistencia de React Query migrada a `PersistQueryClientProvider`
- resolución de error `--host` en Next.js via wrapper `scripts/dev.mjs`
- corrección de errores de tipo en CI (`RateLimitError`, `Intl.NumberFormat` mock)
- mitigación de warnings de hidratación en `layout.tsx` y `CurrencyConverterApp.tsx`
- sincronización exitosa de `AI_CONTEXT.md` con el estado actual del código

### Diferido al siguiente ciclo

- seguir reduciendo el fetch cliente en `src/hooks/useCurrencyConverter.ts`
- evaluar si ese flujo termina en una frontera más server-driven o si queda intencionalmente en React Query
- avanzar con autofixes más agresivos o PR automation

### Estado de salida

El roadmap no queda “terminado” en sentido absoluto, pero sí queda cerrada esta fase de implementación inicial:

- el repo ya se audita mejor
- la documentación viva ya se sincroniza
- la vigilancia React 19 ya produce backlog real
- ya ejecutamos refactors guiados por esa auditoría
- queda una sola oportunidad `medium` abierta para el próximo ciclo

## Propósito

Este roadmap define cómo transformar `currency-converter` en un repositorio que no sólo compile y funcione, sino que además se defienda solo, se documente solo y se modernice solo.

La meta no es “usar IA para escribir más rápido”.

La meta es otra: usar IA para sostener criterio de ingeniería, proteger arquitectura y evitar que el sistema se degrade con el tiempo.

En términos simples:

- queremos un repo difícil de romper
- queremos que la documentación siga al código
- queremos que la IA entienda el sistema sin alucinar
- queremos que los desvíos arquitectónicos se detecten antes de que lleguen a `main`

---

## Principios Rectores

### 1. Arquitectura Hexagonal

La idea es desenchufar el motor de la carrocería.

El dominio del negocio tiene que poder vivir sin React, sin Next.js, sin Zod y sin dependencias concretas. Si mañana cambiamos la UI, el proveedor externo o el mecanismo de fetch, el core no debería enterarse.

Esto hace al proyecto más irrompible porque:

- nos permite reemplazar piezas sin tocar todo
- reduce el costo de refactor
- vuelve a la IA mucho más precisa cuando analiza cambios

### 2. BFF como capa de limpieza

El BFF es la cocina interna de la app.

No queremos que el frontend mastique datos crudos de APIs externas. El backend-for-frontend existe para recibir datos, validarlos, ordenarlos, enriquecernos y entregar un contrato limpio y estable a la UI.

Esto hace al sistema más robusto porque:

- protege al cliente de cambios del upstream
- centraliza validación, errores y observabilidad
- evita que el frontend se convierta en una capa de parcheo

### 3. Resiliencia local / Offline-first

Si la red se cae y la app deja de servir, no tenemos resiliencia: tenemos dependencia.

La app debe poder seguir de pie aunque afuera todo falle. Eso implica persistencia local, degradación elegante y último estado conocido confiable.

Esto importa porque:

- mantiene continuidad operativa
- evita una UX frágil
- desacopla la experiencia del usuario de la salud del upstream

### 4. AI-First de verdad

Un repo AI-first no es uno donde la IA “escribe código”.

Es uno donde:

- la arquitectura está explícita
- los contratos están claros
- la documentación no miente
- las reglas de diseño son auditables
- los agentes pueden operar sin improvisar

---

## Visión

Queremos que el repositorio evolucione hacia este estado:

1. La arquitectura se protege sola.
2. Los contratos se validan solos.
3. La documentación se actualiza sola.
4. La IA detecta deuda técnica y modernización pendiente.
5. Las correcciones mecánicas se aplican solas o casi solas.

En otras palabras: un repo que se mantenga solo sin perder criterio.

---

## Roadmap por Fases

## Fase 1: Blindaje Arquitectónico

### Objetivo

Evitar que entren errores estructurales al repo.

### Resultado esperado

El sistema deja de degradarse silenciosamente.

### Accionables

#### 1. Skill `architecture-observer`

Debe auditar PRs, diffs y ramas buscando violaciones a Clean Architecture / Hexagonal Architecture.

Debe detectar:

- imports desde `src/domain/` hacia `react`, `next/*`, `zod`, `motion/react`
- lógica de negocio metida en `components/`, `hooks/` o `route.ts`
- adapters que conozcan reglas del dominio
- duplicación de reglas entre dominio y cliente

Debe responder con:

- `warn` si hay desvío leve
- `block` si rompe una frontera importante
- `autofix` si el problema es mecánico

#### 2. Skill `zod-contract-guardian`

Debe revisar que toda frontera externa tenga validación explícita.

Debe detectar:

- `fetch().json()` sin parse posterior
- requests sin schema de entrada
- responses sin schema de salida
- contratos duplicados o definidos fuera de la carpeta esperada

#### 3. Guardrails de CI

Integrar chequeos en hooks o CI para que fallen si:

- el dominio importa framework
- aparecen contratos externos sin Zod
- se modifica arquitectura sin actualizar docs base

### Prompt base recomendado

```text
Auditá este diff con criterio de Arquitectura Hexagonal.
Marcá cualquier caso donde el dominio dependa del framework o donde haya lógica de negocio filtrada en UI, hooks, route handlers o adapters.
Clasificá cada hallazgo como warn, block o autofix.
```

---

## Fase 2: Memoria Viva del Sistema

### Objetivo

Lograr que el repo se documente solo y que la IA siempre trabaje con contexto vigente.

### Resultado esperado

La documentación deja de ser una promesa manual y pasa a ser una consecuencia del código.

### Accionables

#### 1. Skill `docs-sync`

Debe analizar cambios en `.ts` y `.tsx` para actualizar automáticamente:

- `README.md`
- `AI_CONTEXT.md`
- changelogs o resúmenes arquitectónicos

Reglas:

- no inventar features
- no documentar roadmap como si fuera implementación
- sólo reflejar cambios respaldados por código

#### 2. Skill `ai-context-sync`

Debe regenerar `AI_CONTEXT.md` leyendo:

- `src/domain/ports/`
- `src/domain/use-cases/`
- `src/infrastructure/contracts/`
- `src/app/api/`

Debe mantener actualizados:

- contratos estables
- flujos de datos
- invariantes del sistema
- puntos de extensión seguros para agentes

#### 3. Skill `readme-curator`

Debe mantener el README como documento ejecutivo-técnico principal:

- decisiones vigentes
- DX
- scripts
- evolución real del stack
- diferencias entre estado actual y exploraciones futuras

### Prompt base recomendado

```text
Compará el código actual con README.md y AI_CONTEXT.md.
Actualizá ambos archivos para que describan sólo decisiones y contratos vigentes.
No conviertas ideas futuras en features supuestamente implementadas.
```

---

## Fase 3: Observador de Patrones de Referencia

### Objetivo

Crear un sistema que compare el repo contra nuestros principios de ingeniería y alerte cuando el código se desvía.

### Resultado esperado

La arquitectura deja de depender de memoria humana.

### Accionables

#### 1. Documento de principios de referencia

Definir un archivo fuente como contrato de diseño. Puede vivir en:

- `AI_CONTEXT.md`
- `docs/reference-principles.md`
- `automation/rules/*.md`

Principios a codificar:

- el dominio no importa framework
- toda integración externa se valida con Zod
- la documentación y el código cambian juntos
- la UI no duplica reglas del dominio
- si React 19 resuelve algo nativamente, preferimos evaluar esa opción antes de sumar librería

#### 2. Skill `pattern-observer`

Debe leer esos principios y auditar cualquier diff.

Debe producir:

- reporte de compliance
- recomendación de refactor
- corrección automática si aplica

### Prompt base recomendado

```text
Usá nuestros principios de referencia como contrato arquitectónico.
Auditá el diff y marcá los desvíos.
Clasificá cada uno como warn, block o autofix.
```

---

## Fase 4: Vigilancia Tecnológica y Modernización React 19

### Objetivo

Tener una auditoría activa que detecte cuándo seguimos resolviendo manualmente algo que React 19 o Next App Router ya resuelven de forma nativa.

### Resultado esperado

La modernización deja de depender de “cuando nos acordemos”.

### Accionables

#### 1. Skill `react19-modernization-auditor`

Debe escanear código vigente y PRs buscando oportunidades concretas de adopción.

#### 2. Server Actions / Server Functions

Detectar:

- formularios con handlers complejos
- mutaciones con `loading/error` manual
- código cliente que debería correrse al servidor

Preguntas que debe responder:

- ¿esto puede pasar a Server Action?
- ¿cuánto boilerplate elimina?
- ¿cuánto JS cliente evita?

#### 3. Streaming & Suspense

Detectar:

- fetching pesado
- render bloqueado por datos
- componentes que podrían entregarse progresivamente

La skill debe proponer:

- boundaries útiles
- posibles `loading.tsx`
- oportunidades de streaming real

#### 4. Actions + `useActionState`

Detectar:

- hooks caseros de submit
- lógica repetida de loading/error/success

Debe proponer cuándo conviene migrar a `useActionState`.

#### 5. `useOptimistic`

Detectar:

- interacciones con latencia perceptible
- casos donde el usuario espera inmediatez

Debe explicar cuándo usarlo y cuándo no.

#### 6. Reporte de modernización

Cada sugerencia debe incluir:

1. patrón actual
2. API nativa sugerida
3. boilerplate que se elimina
4. impacto en bundle size, hidratación o TTI
5. prioridad: ahora, luego o no conviene

### Prompt base recomendado

```text
Auditá este repo con foco en adopción de React 19.
Detectá dónde seguimos usando patrones manuales o librerías externas para resolver algo que React 19 o Next App Router ya resuelven nativamente.
Para cada oportunidad, explicá:
1. qué patrón actual tenemos,
2. qué API nativa lo reemplaza,
3. cuánto boilerplate elimina,
4. cómo mejora bundle size, hidratación o TTI,
5. si conviene hacerlo ahora o dejarlo para después.
```

---

## Fase 5: Auto-Corrección Controlada

### Objetivo

Que la IA no sólo advierta: que también mantenga.

### Resultado esperado

El repo empieza a corregirse solo en problemas previsibles.

### Accionables

#### 1. Skill `autofix-maintainer`

Debe aplicar automáticamente fixes mecánicos como:

- mover archivos a la capa correcta
- regenerar documentación
- actualizar contratos derivados
- corregir imports prohibidos
- limpiar artefactos o drift menor

#### 2. PRs automáticos de housekeeping

Generar PRs o ramas automáticas para:

- documentación desalineada
- modernización menor
- limpieza de patrones repetidos
- actualizaciones de invariantes

#### 3. Modo seguro

Toda autocorrección debe poder ejecutarse con alguno de estos niveles:

- `report-only`
- `suggest-fix`
- `apply-safe-fixes`

---

## Skills Prioritarias a Aprender

Si hay que priorizar, estas son las primeras cinco:

1. `architecture-observer`
2. `ai-context-sync`
3. `docs-sync`
4. `react19-modernization-auditor`
5. `autofix-maintainer`

Orden recomendado:

- primero proteger
- después sincronizar contexto
- después modernizar
- recién al final autocorregir

---

## Automatizaciones Concretas a Implementar

## Bloque A: Guardrails

- script que detecte imports prohibidos por capa
- script que detecte `fetch().json()` sin parse Zod
- script que falle si cambia contrato y no cambia `AI_CONTEXT.md`

## Bloque B: Documentación viva

- script que lea `git diff` y actualice `README.md`
- script que regenere `AI_CONTEXT.md` desde contracts + ports + routes
- script que detecte decisiones caídas del código y las remueva del documento

## Bloque C: Modernización continua

- script o skill que genere un “React 19 modernization report”
- detector de formularios que aún usan estado manual de submit
- detector de oportunidades de streaming y suspense

## Bloque D: Auto-mantenimiento

- tareas de housekeeping en branch separada
- regeneración de docs antes de merge
- fixes triviales aplicados automáticamente

---

## Cómo Hacer Que El Repo “Se Mantenga Solo”

La receta no es sumar automatizaciones aisladas.

La receta es encadenarlas:

1. El observador detecta el desvío.
2. El guardián valida el contrato.
3. La skill documental actualiza contexto.
4. El auditor de React 19 propone modernización.
5. El mantenedor aplica fixes seguros.

Cuando eso pasa, el repo empieza a tener memoria, disciplina y capacidad de corrección.

Ahí recién se vuelve AI-first de verdad.

---

## Recomendación Operativa

### Sí: implementar esto en una branch nueva

Conviene hacerlo en una branch dedicada.

Razones:

- vamos a tocar tooling, docs, observabilidad y reglas de ingeniería
- varias automatizaciones pueden impactar hooks, CI y convenciones del repo
- necesitamos probar sin contaminar `main`
- nos permite separar “infraestructura de mantenimiento” de “features del producto”

### Nombre sugerido de branch

`codex/ai-first-roadmap`

o, si querés algo más explícito:

`codex/automation-guardrails`

### Qué haría primero en esa branch

1. crear carpeta base para automatizaciones
2. definir principios de referencia
3. implementar `architecture-observer`
4. implementar `ai-context-sync`
5. agregar reporter de modernización React 19

---

## Primera Ola de Implementación

Si queremos bajar esto ya a tierra, la secuencia ideal sería:

### Sprint 1

- crear `automation/` o `tools/ai/`
- definir principios de referencia
- implementar detector de imports prohibidos
- implementar detector de contratos sin Zod

### Sprint 2

- generar `AI_CONTEXT.md` desde código
- automatizar actualización de `README.md`
- crear check de documentación alineada

### Sprint 3

- construir `react19-modernization-auditor`
- emitir reporte por PR o por diff local
- clasificar oportunidades por impacto

### Sprint 4

- habilitar auto-fixes seguros
- crear housekeeping automático
- integrar modo `report-only` / `apply-safe-fixes`

---

## Tesis Final

No queremos una IA que escriba más rápido.

Queremos una IA que mantenga al sistema dentro de sus principios aunque nadie lo esté mirando.

Ese es el verdadero estándar de un repositorio AI-first e irrompible.
