import { join } from 'path';
import { rmdir, readFile } from 'fs/promises';
import { exists, isDirMissingOrEmpty } from './io.js';
import { runCommand } from './run-command.js';
import { LOG_LEVELS, die, log } from './log.js';

export async function ensureNpmProjectDir(projectDir) {
  if (!projectDir) { throw new Error('missing project directory'); }
  if (!await exists(join(projectDir, 'package.json'))) {
    die(`'package.json' not found in project directory: ${projectDir}`);
  }
}

export async function npmInstall(projectDir) {
  if (!projectDir) { throw new Error('missing project directory'); }
  const npmModulesPath = join(projectDir, 'node_modules');
  if (!await isDirMissingOrEmpty(npmModulesPath)) {
    log(`Directory "${npmModulesPath}" exists and has content. Skipping 'npm install'.`);
    return;
  }
  log('Starting dependency installation...');
  const { error } = await runCommand('npm install --loglevel=error', {
    stdio: 'inherit',
    cwd: projectDir,
  });
  if (error) {
    die(error);
  }
}

export async function npmBuild(projectDir, buildCommand, distDir, forceRebuild) {
  if (!projectDir) { throw new Error('missing project directory'); }
  if (!buildCommand) { throw new Error('missing build command'); }
  if (!distDir) { throw new Error('missing distribution directory'); }

  const isMissingBuild = await isDirMissingOrEmpty(distDir);

  if (!isMissingBuild && !forceRebuild) {
    log(`Directory "${distDir}" exists and has content. Skipping build: '${buildCommand}'.`);
    return;
  }

  if (forceRebuild) {
    log(`Removing directory "${distDir}" for a clean build (triggered by --build flag).`);
    await rmdir(distDir, { recursive: true });
  }

  log('Starting project build...');
  const { error } = await runCommand(buildCommand, {
    stdio: 'inherit',
    cwd: projectDir,
  });
  if (error) {
    log(error, LOG_LEVELS.WARN); // Cannot disable Vue CLI errors, stderr contains false-positives.
  }
}

export async function getAppName(projectDir) {
  if (!projectDir) { throw new Error('missing project directory'); }
  const packageData = await readPackageJsonContents(projectDir);
  try {
    const packageJson = JSON.parse(packageData);
    if (!packageJson.name) {
      die(`The 'package.json' file doesn't specify a name: ${packageData}`);
    }
    return packageJson.name;
  } catch (error) {
    die(`Unable to parse 'package.json'. Error: ${error}\nContent: ${packageData}`, LOG_LEVELS.ERROR);
    return undefined;
  }
}

async function readPackageJsonContents(projectDir) {
  if (!projectDir) { throw new Error('missing project directory'); }
  const packagePath = join(projectDir, 'package.json');
  if (!await exists(packagePath)) {
    die(`'package.json' file not found at ${packagePath}`);
  }
  try {
    const packageData = await readFile(packagePath, 'utf8');
    return packageData;
  } catch (error) {
    log(`Error reading 'package.json' from ${packagePath}.`, LOG_LEVELS.ERROR);
    die(`Error detail: ${error}`, LOG_LEVELS.ERROR);
    throw error;
  }
}
