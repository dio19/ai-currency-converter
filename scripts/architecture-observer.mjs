import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const rootDir = process.cwd();
const srcDir = path.join(rootDir, 'src');
const principlesFile = path.join(rootDir, 'automation', 'reference-principles.md');

const defaultForbiddenDomainImports = [
  'react',
  'react-dom',
  'next',
  'next/',
  'zod',
  'motion/react',
  'lucide-react',
  '@tanstack/',
  'sonner',
  '@/app',
  '@/components',
  '@/hooks',
  '@/infrastructure',
  '@/lib',
  '@/services',
  '@/utils',
];

const defaultForbiddenInfrastructureImports = ['@/components', '@/hooks', '@/app'];
const requiredValidationImportsForRoutes = ['ExchangeQuerySchema', 'ProblemDetailsSchema', 'z'];

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        return collectFiles(fullPath);
      }
      if (/\.(ts|tsx|js|jsx|mjs|cjs)$/.test(entry.name)) {
        return [fullPath];
      }
      return [];
    })
  );

  return files.flat();
}

function extractImports(sourceCode) {
  const imports = [];
  const importRegex =
    /import\s+(?:type\s+)?(?:[\s\w{},*]+?\s+from\s+)?['"]([^'"]+)['"];?/g;
  let match;

  while ((match = importRegex.exec(sourceCode)) !== null) {
    imports.push(match[1]);
  }

  return imports;
}

function isForbiddenImport(moduleName, forbiddenPrefixes) {
  return forbiddenPrefixes.some((prefix) =>
    prefix.endsWith('/') ? moduleName.startsWith(prefix) : moduleName === prefix || moduleName.startsWith(`${prefix}/`)
  );
}

function toWorkspacePath(filePath) {
  return path.relative(rootDir, filePath).replaceAll(path.sep, '/');
}

function createFinding(severity, filePath, message, details) {
  return {
    severity,
    filePath: toWorkspacePath(filePath),
    message,
    details,
  };
}

async function loadRuleSet() {
  const principles = await readFile(principlesFile, 'utf8').catch(() => '');

  const forbiddenDomainImports = [...defaultForbiddenDomainImports];
  const forbiddenInfrastructureImports = [...defaultForbiddenInfrastructureImports];
  const enabledChecks = {
    domainFrameworkIsolation: principles.includes('El dominio no debe importar'),
    routeValidation: principles.includes('Los Route Handlers deben coordinar'),
    infrastructureUiIsolation: principles.includes('Infrastructure') || principles.includes('adapters'),
  };

  return {
    principles,
    forbiddenDomainImports,
    forbiddenInfrastructureImports,
    enabledChecks,
  };
}

async function main() {
  const ruleSet = await loadRuleSet();
  const files = await collectFiles(srcDir);
  const findings = [];

  for (const file of files) {
    const workspacePath = toWorkspacePath(file);
    const sourceCode = await readFile(file, 'utf8');
    const imports = extractImports(sourceCode);

    if (ruleSet.enabledChecks.domainFrameworkIsolation && workspacePath.startsWith('src/domain/')) {
      for (const importedModule of imports) {
        if (isForbiddenImport(importedModule, ruleSet.forbiddenDomainImports)) {
          findings.push(
            createFinding(
              'block',
              file,
              'El dominio depende de una capa externa o de framework.',
              `Import prohibido detectado en dominio: "${importedModule}".`
            )
          );
        }
      }
    }

    if (ruleSet.enabledChecks.infrastructureUiIsolation && workspacePath.startsWith('src/infrastructure/')) {
      for (const importedModule of imports) {
        if (isForbiddenImport(importedModule, ruleSet.forbiddenInfrastructureImports)) {
          findings.push(
            createFinding(
              'warn',
              file,
              'Infrastructure está importando una capa de UI o delivery.',
              `Import sospechoso en infrastructure: "${importedModule}".`
            )
          );
        }
      }
    }

    if (
      ruleSet.enabledChecks.routeValidation &&
      workspacePath.startsWith('src/app/api/') &&
      workspacePath.endsWith('/route.ts')
    ) {
      const containsFetch = /fetch\s*\(/.test(sourceCode);
      const containsSchemaUsage = requiredValidationImportsForRoutes.some((token) =>
        sourceCode.includes(token)
      );
      const containsServiceCall = /Service|getExchangeSnapshot|exchangeContainer/.test(sourceCode);

      if (containsFetch) {
        findings.push(
          createFinding(
            'warn',
            file,
            'El Route Handler está haciendo fetch directo.',
            'Revisar si esta lógica debería vivir en un adapter o servicio para mantener limpio el delivery layer.'
          )
        );
      }

      if (!containsSchemaUsage) {
        findings.push(
          createFinding(
            'warn',
            file,
            'No se detectó validación explícita en el Route Handler.',
            'Revisar si la query o la salida deberían validarse con un schema compartido.'
          )
        );
      }

      if (!containsServiceCall) {
        findings.push(
          createFinding(
            'warn',
            file,
            'El Route Handler no parece delegar a una capa de aplicación.',
            'Revisar si está acumulando coordinación o lógica propia en vez de delegar.'
          )
        );
      }
    }
  }

  if (findings.length === 0) {
    console.log('Architecture Observer: no se detectaron desvíos en las reglas actuales.');
    return;
  }

  console.log('Architecture Observer Report');
  console.log('');
  console.log(`Rules source: ${path.relative(rootDir, principlesFile).replaceAll(path.sep, '/')}`);
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

  if (findings.some((finding) => finding.severity === 'block')) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error('Architecture Observer failed.');
  console.error(error);
  process.exitCode = 1;
});
