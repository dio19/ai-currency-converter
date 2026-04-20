import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const rootDir = process.cwd();
const outputFile = path.join(rootDir, 'automation', 'generated', 'ai-context-snapshot.md');
const aiContextFile = path.join(rootDir, 'AI_CONTEXT.md');
const generatedStartMarker = '<!-- AI-CONTEXT:GENERATED START -->';
const generatedEndMarker = '<!-- AI-CONTEXT:GENERATED END -->';

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

function extractExports(sourceCode) {
  const exportRegex =
    /export\s+(?:interface|type|class|function|const)\s+([A-Za-z0-9_]+)/g;
  const exportedNames = [];
  let match;

  while ((match = exportRegex.exec(sourceCode)) !== null) {
    exportedNames.push(match[1]);
  }

  return exportedNames;
}

async function buildSection(title, directory) {
  const files = await collectFiles(path.join(rootDir, directory));
  const lines = [`## ${title}`, ''];

  for (const file of files.sort()) {
    const sourceCode = await readFile(file, 'utf8');
    const exportedNames = extractExports(sourceCode);
    lines.push(`- \`${relative(file)}\``);

    if (exportedNames.length > 0) {
      lines.push(`  - exports: ${exportedNames.join(', ')}`);
    }
  }

  lines.push('');
  return lines.join('\n');
}

async function generateSnapshot() {
  const sections = await Promise.all([
    buildSection('Domain Inventory', 'src/domain'),
    buildSection('Infrastructure Contracts', 'src/infrastructure/contracts'),
    buildSection('Infrastructure Adapters', 'src/infrastructure/adapters'),
    buildSection('Server Actions', 'src/app/actions'),
    buildSection('Delivery Endpoints', 'src/app/api'),
  ]);

  return [
    '# AI Context Snapshot',
    '',
    '> Archivo generado para asistir la sincronización de `AI_CONTEXT.md` con el código real.',
    '',
    ...sections,
  ].join('\n');
}

function injectGeneratedSection(documentContent, generatedContent) {
  const startIndex = documentContent.indexOf(generatedStartMarker);
  const endIndex = documentContent.indexOf(generatedEndMarker);

  if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
    throw new Error('AI_CONTEXT.md does not contain the expected generated section markers.');
  }

  const before = documentContent.slice(0, startIndex + generatedStartMarker.length);
  const after = documentContent.slice(endIndex);

  return `${before}\n\n${generatedContent}\n${after}`;
}

function extractGeneratedSection(documentContent) {
  const startIndex = documentContent.indexOf(generatedStartMarker);
  const endIndex = documentContent.indexOf(generatedEndMarker);

  if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
    throw new Error('AI_CONTEXT.md does not contain the expected generated section markers.');
  }

  const sectionStart = startIndex + generatedStartMarker.length;
  return documentContent.slice(sectionStart, endIndex).trim();
}

async function main() {
  const shouldCheck = process.argv.includes('--check');
  const snapshot = await generateSnapshot();
  const aiContextContent = await readFile(aiContextFile, 'utf8');
  const updatedAiContext = injectGeneratedSection(aiContextContent, snapshot);

  await mkdir(path.dirname(outputFile), { recursive: true });

  if (shouldCheck) {
    const existing = await readFile(outputFile, 'utf8').catch(() => '');
    const embeddedSection = extractGeneratedSection(aiContextContent);
    if (existing.trim() !== snapshot.trim() || embeddedSection !== snapshot.trim()) {
      console.error('AI context snapshot is out of date. Run `npm run sync:ai-context`.');
      process.exitCode = 1;
      return;
    }

    console.log('AI context snapshot is up to date.');
    return;
  }

  await writeFile(outputFile, snapshot, 'utf8');
  await writeFile(aiContextFile, updatedAiContext, 'utf8');
  console.log(`AI context snapshot written to ${relative(outputFile)}.`);
  console.log(`AI_CONTEXT.md generated section synchronized.`);
}

main().catch((error) => {
  console.error('AI context sync failed.');
  console.error(error);
  process.exitCode = 1;
});
