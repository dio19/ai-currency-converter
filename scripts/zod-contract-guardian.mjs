import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const rootDir = process.cwd();
const scanRoots = [
  path.join(rootDir, 'src', 'app', 'api'),
  path.join(rootDir, 'src', 'hooks'),
  path.join(rootDir, 'src', 'services'),
  path.join(rootDir, 'src', 'infrastructure', 'adapters'),
];

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true }).catch(() => []);
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        return collectFiles(fullPath);
      }

      return /\.(ts|tsx|js|jsx|mjs|cjs)$/.test(entry.name) ? [fullPath] : [];
    })
  );

  return files.flat();
}

function relative(filePath) {
  return path.relative(rootDir, filePath).replaceAll(path.sep, '/');
}

function hasSchemaValidation(sourceCode) {
  return (
    /\.parse\s*\(/.test(sourceCode) ||
    /\.safeParse\s*\(/.test(sourceCode) ||
    /schemaValidator\.parse\s*\(/.test(sourceCode)
  );
}

function addFinding(findings, severity, filePath, message, details) {
  findings.push({
    severity,
    filePath: relative(filePath),
    message,
    details,
  });
}

async function main() {
  const files = (await Promise.all(scanRoots.map((directory) => collectFiles(directory)))).flat();
  const findings = [];

  for (const file of files) {
    const sourceCode = await readFile(file, 'utf8');
    const hasFetch = /fetch\s*\(/.test(sourceCode);
    const hasJsonParsing = /\.json\s*\(/.test(sourceCode);
    const hasValidation = hasSchemaValidation(sourceCode);
    const isRouteHandler = relative(file).includes('src/app/api/') && relative(file).endsWith('/route.ts');
    const isClientHook = relative(file).startsWith('src/hooks/');

    if (hasFetch && hasJsonParsing && !hasValidation) {
      addFinding(
        findings,
        isRouteHandler ? 'block' : 'warn',
        file,
        'Se detectó fetch con `.json()` sin validación Zod explícita.',
        'Validá el payload en el borde usando `.parse`, `.safeParse` o `schemaValidator.parse`.'
      );
    }

    if (isRouteHandler && !/Schema/.test(sourceCode)) {
      addFinding(
        findings,
        'warn',
        file,
        'El Route Handler no parece usar schemas compartidos.',
        'Revisar si la query, la salida o los errores deberían apoyarse en contratos de infrastructure/contracts.'
      );
    }

    if (isClientHook && hasFetch && !/ProblemDetailsSchema|ExchangeResponseSchema|Schema/.test(sourceCode)) {
      addFinding(
        findings,
        'warn',
        file,
        'Hay fetch en un hook cliente sin contrato explícito visible.',
        'Revisar si el hook está parseando tanto la respuesta exitosa como el error de manera consistente.'
      );
    }
  }

  if (findings.length === 0) {
    console.log('Zod Contract Guardian: no se detectaron contratos desprotegidos con las heurísticas actuales.');
    return;
  }

  console.log('Zod Contract Guardian Report');
  console.log('');

  for (const finding of findings) {
    console.log(`[${finding.severity.toUpperCase()}] ${finding.filePath}`);
    console.log(`- ${finding.message}`);
    console.log(`- ${finding.details}`);
    console.log('');
  }

  const blockCount = findings.filter((finding) => finding.severity === 'block').length;
  const warnCount = findings.filter((finding) => finding.severity === 'warn').length;
  console.log(`Summary: ${blockCount} block, ${warnCount} warn.`);

  if (blockCount > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error('Zod Contract Guardian failed.');
  console.error(error);
  process.exitCode = 1;
});
