#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const packageJson = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));

const passthroughArgs = [];
let dryRun = false;
let skipBuild = false;
let help = false;

for (const arg of process.argv.slice(2)) {
  if (arg === '--') {
    continue;
  } else if (arg === '--dry-run') {
    dryRun = true;
  } else if (arg === '--skip-build') {
    skipBuild = true;
  } else if (arg === '--help' || arg === '-h') {
    help = true;
  } else {
    passthroughArgs.push(arg);
  }
}

if (help) {
  console.log(`Usage: pnpm deploy:quick -- [options] [...wrangler deploy args]

Options:
  --dry-run      Validate the deploy without publishing
  --skip-build   Deploy the existing docs/.vitepress/dist build
  -h, --help     Show this help message

Examples:
  pnpm deploy:quick
  pnpm deploy:quick -- --dry-run
  pnpm deploy:quick -- --skip-build --dry-run
`);
  process.exit(0);
}

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: root,
    env: process.env,
    stdio: 'inherit'
  });

  if (result.error) {
    console.error(result.error.message);
    process.exit(1);
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

console.log(`\nDeploying ${packageJson.name}${dryRun ? ' (dry run)' : ''}\n`);

run('pnpm', ['exec', 'wrangler', 'whoami']);

if (!skipBuild) {
  run('pnpm', ['build']);
}

run('pnpm', ['exec', 'wrangler', 'deploy', ...(dryRun ? ['--dry-run'] : []), ...passthroughArgs]);
