/*
Description:
  Runs the GitHub workflow checks locally in Docker (Linux legs only), see docs/ci-cd.md.

Usage:
  npm run ci:local [-- <options>]

Options:
  --list              Lists jobs and exits.
  --only <a,b>        Runs only these jobs (extended jobs included when named).
  --skip <a,b>        Skips these jobs.
  --all               Also runs extended jobs (desktop runtime, external URLs, CodeQL,
                      install-deps).
  --worktree          Tests the working tree, including uncommitted and untracked files,
                      instead of a commit.
  --ref <rev>         Commit to test when not using --worktree (default: HEAD).
  --keep              Keeps the CI container for inspection.
*/

import { spawn } from 'node:child_process';
import { createReadStream, createWriteStream } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { join, resolve, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { JOBS, PREPARE_STEPS, ROOT_PREPARE_STEPS } from './jobs.js'; // eslint-disable-line import/extensions

const PROJECT_ROOT = resolve(fileURLToPath(new URL('.', import.meta.url)), '../..');
const CI_IMAGE = 'privacy-sexy-local-ci';
const WEB_IMAGE = 'privacy-sexy-local-ci-web';
const CACHE_VOLUMES = {
  'privacy-sexy-local-ci-npm': '/home/node/.npm',
  'privacy-sexy-local-ci-cache': '/home/node/.cache',
};
const LOCAL_TOOL_DIRS = ['.omo', '.playwright-mcp', '.solidkg'];

function parseArgs(argv) {
  const valueOf = (name) => {
    const index = argv.indexOf(name);
    if (index === -1) return undefined;
    const value = argv[index + 1];
    if (!value || value.startsWith('--')) throw new Error(`Missing value for ${name}`);
    return value;
  };
  const listOf = (name) => (valueOf(name)?.split(',').map((id) => id.trim()).filter(Boolean));
  const options = {
    list: argv.includes('--list'),
    only: listOf('--only'),
    skip: listOf('--skip') ?? [],
    all: argv.includes('--all'),
    worktree: argv.includes('--worktree'),
    ref: valueOf('--ref') ?? 'HEAD',
    keep: argv.includes('--keep'),
  };
  const unknown = [...(options.only ?? []), ...options.skip]
    .filter((id) => !JOBS.some((job) => job.id === id));
  if (unknown.length) throw new Error(`Unknown job(s): ${unknown.join(', ')}. Use --list.`);
  return options;
}

function selectJobs({ only, skip, all }) {
  return JOBS
    .filter((job) => (only ? only.includes(job.id) : (all || !job.extended)))
    .filter((job) => !skip.includes(job.id));
}

function run(command, args, {
  log, input, capture = false, env,
} = {}) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(command, args, {
      cwd: PROJECT_ROOT,
      env: { ...process.env, ...env },
      stdio: [input ? 'pipe' : 'ignore', 'pipe', 'pipe'],
    });
    let stdout = '';
    child.stdout.on('data', (chunk) => {
      if (capture) stdout += chunk;
      else process.stdout.write(chunk);
      log?.write(chunk);
    });
    child.stderr.on('data', (chunk) => {
      process.stderr.write(chunk);
      log?.write(chunk);
    });
    if (input) createReadStream(input).pipe(child.stdin);
    child.on('error', reject);
    child.on('close', (code) => resolvePromise({ code, stdout: stdout.trim() }));
  });
}

async function runOrThrow(command, args, options) {
  const result = await run(command, args, options);
  if (result.code !== 0) throw new Error(`Command failed (${result.code}): ${command} ${args.join(' ')}`);
  return result.stdout;
}

async function resolveSourceTree({ worktree, ref }, runDir) {
  if (!worktree) return runOrThrow('git', ['rev-parse', '--verify', `${ref}^{commit}`], { capture: true });
  const env = { GIT_INDEX_FILE: join(runDir, 'snapshot.index') };
  await runOrThrow('git', ['read-tree', 'HEAD'], { env });
  const exclusions = LOCAL_TOOL_DIRS.map((dir) => `:(exclude)${dir}`);
  await runOrThrow('git', ['add', '-A', '--', '.', ...exclusions], { env });
  return runOrThrow('git', ['write-tree'], { capture: true, env });
}

async function runContainerJob(container, job, runDir, log) {
  const envArgs = Object.entries(job.env ?? {}).flatMap(([key, value]) => ['-e', `${key}=${value}`]);
  let passed = true;
  for (const step of job.steps) {
    const banner = `\n> ${step}\n`;
    process.stdout.write(banner);
    log.write(banner);
    // eslint-disable-next-line no-await-in-loop
    const { code } = await run('docker', ['exec', '-w', '/work', ...envArgs, container, 'bash', '-o', 'pipefail', '-ec', step], { log });
    if (code !== 0) {
      passed = false;
      break;
    }
  }
  const artifactDir = join(runDir, job.id);
  for (const artifact of job.artifacts ?? []) {
    // eslint-disable-next-line no-await-in-loop
    const { code } = await run('docker', ['exec', container, 'test', '-e', `/work/${artifact}`], { capture: true });
    if (code !== 0) continue; // eslint-disable-line no-continue
    // eslint-disable-next-line no-await-in-loop
    await mkdir(artifactDir, { recursive: true });
    // eslint-disable-next-line no-await-in-loop
    await runOrThrow('docker', ['cp', `${container}:/work/${artifact}`, join(artifactDir, basename(artifact))], { capture: true, log });
  }
  return passed;
}

async function runBuildDockerJob(sourceTar, log) {
  const tag = `${WEB_IMAGE}:latest`;
  if ((await run('docker', ['build', '-t', tag, '-'], { input: sourceTar, log })).code !== 0) return false;
  const containerId = await runOrThrow('docker', ['run', '-d', '--rm', '-p', '127.0.0.1::80', tag], { capture: true, log });
  try {
    const port = (await runOrThrow('docker', ['port', containerId, '80/tcp'], { capture: true })).split(':').pop();
    const verify = ['scripts/verify-web-server-status.js', '--url', `http://localhost:${port}`, '--max-retries', '30'];
    return (await run(process.execPath, verify, { log })).code === 0;
  } finally {
    await run('docker', ['rm', '--force', containerId], { capture: true });
  }
}

function printSummary(results) {
  const lines = results.map(({ id, status, seconds }) => `  ${status.padEnd(6)} ${id.padEnd(26)} ${seconds}s`);
  console.log(`\nLocal CI summary:\n${lines.join('\n')}`);
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.list) {
    JOBS.forEach((job) => console.log(`${job.id.padEnd(26)} ${job.workflow}${job.extended ? ' (extended)' : ''}`));
    return;
  }
  const jobs = selectJobs(options);
  const runId = new Date().toISOString()
    .replace(/[-:]/g, '')
    .replace(/\..+/, '')
    .replace('T', '-');
  const runDir = join(PROJECT_ROOT, 'dist-ci', runId);
  await mkdir(runDir, { recursive: true });
  const tree = await resolveSourceTree(options, runDir);
  const sourceTar = join(runDir, 'source.tar');
  await runOrThrow('git', ['archive', '--format=tar', '-o', sourceTar, tree]);
  console.log(`Testing ${options.worktree ? 'working tree' : options.ref} (${tree.slice(0, 10)}): ${jobs.map((job) => job.id).join(', ')}`);

  await runOrThrow('docker', ['build', '-t', CI_IMAGE, 'scripts/local-ci']);
  const container = `privacy-sexy-local-ci-${runId}`;
  const volumes = Object.entries(CACHE_VOLUMES).flatMap(([name, path]) => ['-v', `${name}:${path}`]);
  const sandbox = ['--init', '--shm-size=2g', '--security-opt', 'seccomp=unconfined'];
  const runArgs = ['run', '-d', '--name', container, ...sandbox, ...volumes, CI_IMAGE, 'sleep', 'infinity'];
  await runOrThrow('docker', runArgs, { capture: true });

  const results = [];
  try {
    await runOrThrow('docker', ['cp', sourceTar, `${container}:/tmp/source.tar`]);
    const prepareLog = createWriteStream(join(runDir, 'prepare.log'));
    const originUrl = await runOrThrow('git', ['remote', 'get-url', 'origin'], { capture: true });
    for (const step of ROOT_PREPARE_STEPS) {
      // eslint-disable-next-line no-await-in-loop
      await runOrThrow('docker', ['exec', '-u', 'root', container, 'bash', '-ec', step], { log: prepareLog });
    }
    for (const step of PREPARE_STEPS) {
      const execArgs = ['exec', '-w', '/work', '-e', `ORIGIN_URL=${originUrl}`, container];
      // eslint-disable-next-line no-await-in-loop
      await runOrThrow('docker', [...execArgs, 'bash', '-o', 'pipefail', '-ec', step], { log: prepareLog });
    }
    prepareLog.end();
    for (const job of jobs) {
      console.log(`\n=== ${job.id} (${job.workflow})`);
      const log = createWriteStream(join(runDir, `${job.id}.log`));
      const started = Date.now();
      // eslint-disable-next-line no-await-in-loop
      const passed = await (job.host
        ? runBuildDockerJob(sourceTar, log)
        : runContainerJob(container, job, runDir, log));
      log.end();
      results.push({ id: job.id, status: passed ? 'PASS' : 'FAIL', seconds: Math.round((Date.now() - started) / 1000) });
    }
  } finally {
    if (options.keep) console.log(`\nKept container: docker exec -it ${container} bash`);
    else await run('docker', ['rm', '--force', container], { capture: true });
  }
  printSummary(results);
  await writeFile(join(runDir, 'summary.json'), `${JSON.stringify({ tree, options, results }, null, 2)}\n`);
  console.log(`Logs and artifacts: ${runDir}`);
  if (results.some((result) => result.status === 'FAIL')) process.exitCode = 1;
}

try {
  await main();
} catch (error) {
  console.error(`local-ci: ${error.message}`);
  process.exitCode = 1;
}
