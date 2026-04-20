import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const rootDir = process.cwd();
const srcDir = path.join(rootDir, 'src');
const outputFile = path.join(
  rootDir,
  'automation',
  'generated',
  'react19-modernization-report.md'
);

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        return collectFiles(fullPath);
      }
      return /\.(ts|tsx)$/.test(entry.name) ? [fullPath] : [];
    })
  );

  return files.flat();
}

function relative(filePath) {
  return path.relative(rootDir, filePath).replaceAll(path.sep, '/');
}

function addFinding(findings, category, filePath, rationale, impact, priority, recommendation) {
  findings.push({
    category,
    filePath: relative(filePath),
    rationale,
    impact,
    priority,
    recommendation,
  });
}

async function main() {
  const files = await collectFiles(srcDir);
  const findings = [];
  const sourceEntries = await Promise.all(
    files.map(async (file) => [file, await readFile(file, 'utf8')])
  );
  const hasServerSideQueryHydration = sourceEntries.some(([, sourceCode]) =>
    /HydrationBoundary|dehydrate\s*\(|setQueryData\s*\(|prefetchQuery\s*\(/.test(sourceCode)
  );

  for (const [file, sourceCode] of sourceEntries) {
    const isClientComponent = sourceCode.includes("'use client'") || sourceCode.includes('"use client"');

    if (isClientComponent && /useState<[^>]*>\([^)]*\)\s*;?/m.test(sourceCode) && /(isLoading|isError|isPending)/.test(sourceCode)) {
      addFinding(
        findings,
        'Actions / useActionState',
        file,
        'Se detectó manejo manual de estado de carga o error en un componente cliente.',
        'Potencial reducción de boilerplate de UI y mejor integración con transiciones o acciones nativas.',
        'medium',
        'Evaluar migrar estados manuales de submit a `useActionState` o a una Action integrada con transición.'
      );
    }

    if (isClientComponent && /fetch\s*\(/.test(sourceCode)) {
      addFinding(
        findings,
        'Server Actions / Data Boundary',
        file,
        hasServerSideQueryHydration
          ? 'Hay fetch en capa cliente, pero el proyecto ya muestra una frontera server-first con hidratación inicial. Queda una oportunidad de seguir reduciendo coordinación manual en cliente.'
          : 'Hay fetch directo en capa cliente; revisar si parte de esta interacción puede moverse a Server Functions o a una frontera más server-first.',
        hasServerSideQueryHydration
          ? 'La hidratación inicial ya baja trabajo del primer render, pero todavía hay margen para reducir JavaScript cliente y simplificar revalidación.'
          : 'Menos JavaScript cliente y menos coordinación manual entre loading, error y data.',
        hasServerSideQueryHydration ? 'medium' : 'high',
        hasServerSideQueryHydration
          ? 'Conservar el warmup server-first y evaluar si la recarga posterior puede simplificarse con boundaries más nativos o una estrategia de navegación server-driven.'
          : 'Revisar si la mutación o la coordinación de datos puede pasar a Server Functions / Server Actions.'
      );
    }

    if (isClientComponent && /useEffect\s*\(/.test(sourceCode) && /fetch\s*\(|persistQueryClient|createSyncStoragePersister/.test(sourceCode)) {
      addFinding(
        findings,
        'Server Actions / Client Effects',
        file,
        'Se detectó coordinación de datos o persistencia desde `useEffect` en cliente.',
        'Mover parte de la coordinación al servidor o reducir efectos manuales puede achicar hidratación y bajar complejidad de arranque.',
        'medium',
        'Revisar si la inicialización puede moverse a una frontera server-first o a APIs nativas menos manuales.'
      );
    }

    if (/useOptimistic/.test(sourceCode)) {
      addFinding(
        findings,
        'Optimistic Updates',
        file,
        'El archivo ya usa `useOptimistic`; conviene revisar si la experiencia y los boundaries están alineados con las acciones reales.',
        'Mejora de respuesta percibida sin sobrehidratar el cliente.',
        'low',
        'Auditar si el optimistic state está asociado a una Action o transición real.'
      );
    }

    if (/useQuery\s*\(/.test(sourceCode) && /fetch\s*\(/.test(sourceCode)) {
      addFinding(
        findings,
        'React 19 Native Boundary Review',
        file,
        hasServerSideQueryHydration
          ? 'Hay una capa cliente que combina fetch directo con estado remoto administrado por librería, aunque ahora convive con hidratación inicial desde el servidor.'
          : 'Hay una capa cliente que combina fetch directo con estado remoto administrado por librería.',
        hasServerSideQueryHydration
          ? 'El primer render ya llega más liviano; la próxima mejora es revisar si la revalidación completa sigue necesitando toda esta capa cliente.'
          : 'En algunos flujos esto puede resolverse con boundaries server-first, `Suspense` o Actions, reduciendo JS cliente.',
        hasServerSideQueryHydration ? 'medium' : 'high',
        hasServerSideQueryHydration
          ? 'Revisar si conviene conservar React Query sólo para cambios interactivos o seguir migrando el flujo hacia navegación y boundaries server-driven.'
          : 'Evaluar si este flujo realmente necesita librería cliente o si React 19 + App Router pueden absorber parte del trabajo.'
      );
    }

    if (/next\/head/.test(sourceCode)) {
      addFinding(
        findings,
        'Native Metadata',
        file,
        'Se detectó uso de `next/head` en un proyecto con App Router.',
        'Migrar a metadata nativa reduce APIs superpuestas y simplifica el árbol de render.',
        'medium',
        'Migrar este caso a `export const metadata` o a metadata de segmento si aplica.'
      );
    }

    if (/forwardRef\s*\(/.test(sourceCode)) {
      addFinding(
        findings,
        'Ref Simplification',
        file,
        'Se detectó uso de `forwardRef`; conviene revisar si sigue siendo necesario o si puede simplificarse.',
        'Menos wrappers y menos superficie de compatibilidad en componentes cliente.',
        'low',
        'Auditar si el componente realmente necesita forwarding o si puede exponerse de manera más directa.'
      );
    }
  }

  const loadingFileExists = files.some((file) => relative(file).endsWith('loading.tsx'));
  if (!loadingFileExists) {
    findings.push({
      category: 'Streaming & Suspense',
      filePath: 'src/app',
      rationale:
        'No se detectó `loading.tsx` a nivel de ruta; hay una oportunidad de revisar si el App Router puede entregar una UX más progresiva.',
      impact:
        'Mejor TTI percibido y menos bloqueo visual mientras llegan datos del servidor.',
      priority: 'medium',
      recommendation:
        'Evaluar si conviene introducir `loading.tsx`, boundaries de `Suspense` o streaming progresivo en rutas con fetching pesado.',
    });
  }

  const lines = [
    '# React 19 Modernization Report',
    '',
    '> Reporte heurístico inicial. No reemplaza revisión humana; prioriza oportunidades de modernización.',
    '',
    `Generated at: ${new Date().toISOString()}`,
    '',
  ];

  if (findings.length === 0) {
    lines.push('No se detectaron oportunidades obvias con las heurísticas actuales.');
  } else {
    const countsByPriority = findings.reduce(
      (accumulator, finding) => {
        accumulator[finding.priority] = (accumulator[finding.priority] ?? 0) + 1;
        return accumulator;
      },
      { high: 0, medium: 0, low: 0 }
    );

    lines.push('## Summary');
    lines.push('');
    lines.push(`- high: ${countsByPriority.high}`);
    lines.push(`- medium: ${countsByPriority.medium}`);
    lines.push(`- low: ${countsByPriority.low}`);
    lines.push('');

    for (const finding of findings) {
      lines.push(`## ${finding.category}`);
      lines.push('');
      lines.push(`- file: \`${finding.filePath}\``);
      lines.push(`- priority: ${finding.priority}`);
      lines.push(`- rationale: ${finding.rationale}`);
      lines.push(`- performance-impact: ${finding.impact}`);
      lines.push(`- recommended-action: ${finding.recommendation}`);
      lines.push('');
    }
  }

  await mkdir(path.dirname(outputFile), { recursive: true });
  await writeFile(outputFile, lines.join('\n'), 'utf8');
  console.log(`React 19 modernization report written to ${relative(outputFile)}.`);
}

main().catch((error) => {
  console.error('React 19 modernization report failed.');
  console.error(error);
  process.exitCode = 1;
});
