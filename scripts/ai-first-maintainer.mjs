import { spawn } from 'node:child_process';

const mode = process.argv.includes('--apply-safe-fixes') ? 'apply-safe-fixes' : 'report-only';

const tasks = [
  {
    name: 'sync-ai-context',
    command: 'node',
    args: ['scripts/ai-context-sync.mjs'],
    modifiesFiles: true,
  },
  {
    name: 'report-react19',
    command: 'node',
    args: ['scripts/react19-modernization-report.mjs'],
    modifiesFiles: true,
  },
];

function runTask(task) {
  return new Promise((resolve, reject) => {
    const child = spawn(task.command, task.args, {
      stdio: 'inherit',
      shell: false,
    });

    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`Task "${task.name}" failed with exit code ${code ?? 'unknown'}.`));
    });
  });
}

async function main() {
  console.log('AI-First Maintainer');
  console.log(`Mode: ${mode}`);
  console.log('');

  if (mode === 'report-only') {
    console.log('Safe tasks available:');
    for (const task of tasks) {
      console.log(`- ${task.name}${task.modifiesFiles ? ' (writes files)' : ''}`);
    }
    console.log('');
    console.log('Run `npm run fix:ai-first` to apply the safe maintenance tasks.');
    return;
  }

  for (const task of tasks) {
    console.log(`Running ${task.name}...`);
    await runTask(task);
  }

  console.log('');
  console.log('AI-first safe maintenance completed.');
}

main().catch((error) => {
  console.error('AI-first maintainer failed.');
  console.error(error);
  process.exitCode = 1;
});
