/*
Description:
  This script manages NPM dependencies for a project.
  It offers capabilities like doing a fresh install, retries on network errors, and other features.

Usage:
  npm run install-deps [-- <options>]
  node scripts/npm-install.js [options]

Options:
  --root-directory <path>
    Specifies the root directory where package.json resides
    Defaults to the current working directory.
    Example: npm run install-deps -- --root-directory /your/path/here

  --no-errors
    Ignores errors and continues the execution.
    Example: npm run install-deps -- --no-errors

  --ci
    Uses 'npm ci' for dependency installation instead of 'npm install'.
    Example: npm run install-deps -- --ci

  --fresh
    Removes the existing node_modules directory before installing dependencies.
    Example: npm run install-deps -- --fresh

  --non-deterministic
    Removes package-lock.json for a non-deterministic installation.
    Example: npm run install-deps -- --non-deterministic

Note:

  Flags can be combined as needed.
  Example: npm run install-deps -- --fresh --non-deterministic
*/

import { exec } from 'child_process';
import { resolve } from 'path';
import { access, rm, unlink } from 'fs/promises';
import { constants } from 'fs';

const MAX_RETRIES = 5;
const RETRY_DELAY_IN_MS = 5 /* seconds */ * 1000;
const ARG_NAMES = {
  rootDirectory: '--root-directory',
  ignoreErrors: '--no-errors',
  ci: '--ci',
  fresh: '--fresh',
  nonDeterministic: '--non-deterministic',
};

async function main() {
  const options = getOptions();
  console.log('Options:', options);
  await ensureNpmRootDirectory(options.rootDirectory);
  await ensureNpmIsAvailable();
  if (options.fresh) {
    await removeNodeModules(options.rootDirectory);
  }
  if (options.nonDeterministic) {
    await removePackageLockJson(options.rootDirectory);
  }
  const command = buildCommand(options.ci, options.outputErrors);
  console.log('Starting dependency installation...');
  const exitCode = await executeWithRetry(
    command,
    options.workingDirectory,
    MAX_RETRIES,
    RETRY_DELAY_IN_MS,
  );
  if (exitCode === 0) {
    console.log('🎊 Installed dependencies...');
  } else {
    console.error(`💀 Failed to install dependencies, exit code: ${exitCode}`);
  }
  process.exit(exitCode);
}

async function removeNodeModules(workingDirectory) {
  const nodeModulesDirectory = resolve(workingDirectory, 'node_modules');
  if (await exists('./node_modules')) {
    console.log('Removing node_modules...');
    await rm(nodeModulesDirectory, { recursive: true });
  }
}

async function removePackageLockJson(workingDirectory) {
  const packageLockJsonFile = resolve(workingDirectory, 'package-lock.json');
  if (await exists(packageLockJsonFile)) {
    console.log('Removing package-lock.json...');
    await unlink(packageLockJsonFile);
  }
}

async function ensureNpmIsAvailable() {
  const exitCode = await executeCommand('npm --version');
  if (exitCode !== 0) {
    throw new Error('`npm` in not available!');
  }
}

async function ensureNpmRootDirectory(workingDirectory) {
  const packageJsonPath = resolve(workingDirectory, 'package.json');
  if (!await exists(packageJsonPath)) {
    throw new Error(`Not an NPM project root: ${workingDirectory}`);
  }
}

function buildCommand(ci, outputErrors) {
  const baseCommand = ci ? 'npm ci' : 'npm install';
  if (!outputErrors) {
    return `${baseCommand} --loglevel=error`;
  }
  return baseCommand;
}

function getOptions() {
  const processArgs = process.argv.slice(2); // Slice off the node and script name
  return {
    rootDirectory: processArgs.includes('--root-directory') ? processArgs[processArgs.indexOf('--root-directory') + 1] : process.cwd(),
    outputErrors: !processArgs.includes(ARG_NAMES.ignoreErrors),
    ci: processArgs.includes(ARG_NAMES.ci),
    fresh: processArgs.includes(ARG_NAMES.fresh),
    nonDeterministic: processArgs.includes(ARG_NAMES.nonDeterministic),
  };
}

async function executeWithRetry(
  command,
  workingDirectory,
  maxRetries,
  retryDelayInMs,
  currentAttempt = 1,
) {
  const statusCode = await executeCommand(command, workingDirectory, true, true);
  if (statusCode === 0 || currentAttempt >= maxRetries) {
    return statusCode;
  }

  console.log(`⚠️🔄 Attempt ${currentAttempt} failed. Retrying in ${retryDelayInMs / 1000} seconds...`);
  await sleep(retryDelayInMs);

  const retryResult = await executeWithRetry(
    command,
    workingDirectory,
    maxRetries,
    retryDelayInMs,
    currentAttempt + 1,
  );
  return retryResult;
}

async function executeCommand(
  command,
  workingDirectory = process.cwd(),
  logStdout = false,
  logCommand = false,
) {
  if (logCommand) {
    console.log(`▶️ Executing command "${command}" at "${workingDirectory}"`);
  }
  const process = exec(
    command,
    {
      cwd: workingDirectory,
    },
  );
  if (logStdout) {
    process.stdout.on('data', (data) => {
      console.log(data.toString());
    });
  }
  process.stderr.on('data', (data) => {
    console.error(data.toString());
  });
  return new Promise((resolve) => {
    process.on('exit', (code) => {
      resolve(code);
    });
  });
}

function sleep(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

async function exists(path) {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

await main();
