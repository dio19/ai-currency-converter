import { spawn } from 'node:child_process';

// Get arguments passed to this script
const rawArgs = process.argv.slice(2);

// Filter out --host if it appears (and its value if it's 0.0.0.0 or similar)
const filteredArgs = [];
for (let i = 0; i < rawArgs.length; i++) {
  if (rawArgs[i] === '--host') {
    // skip this and next if next is a hostname
    if (rawArgs[i + 1] && !rawArgs[i + 1].startsWith('-')) {
      i++; 
    }
    continue;
  }
  filteredArgs.push(rawArgs[i]);
}

// Ensure --hostname and --port are set correctly for the environment
const finalArgs = ['dev', '--hostname', '0.0.0.0', '--port', '3000', ...filteredArgs];

console.log('Starting Next.js with args:', finalArgs.join(' '));

const child = spawn('npx', ['next', ...finalArgs], {
  stdio: 'inherit',
  shell: true,
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});
