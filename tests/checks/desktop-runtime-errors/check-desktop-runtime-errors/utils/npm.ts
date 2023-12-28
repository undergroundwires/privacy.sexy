import { join } from 'node:path';
import { rm, readFile } from 'node:fs/promises';
import { exists, isDirMissingOrEmpty } from './io';
import { runCommand } from './run-command';
import { LogLevel, die, log } from './log';

export async function ensureNpmProjectDir(projectDir: string): Promise<void> {
  if (!projectDir) { throw new Error('missing project directory'); }
  if (!await exists(join(projectDir, 'package.json'))) {
    die(`\`package.json\` not found in project directory: ${projectDir}`);
  }
}

export async function npmInstall(projectDir: string): Promise<void> {
  if (!projectDir) { throw new Error('missing project directory'); }
  const npmModulesPath = join(projectDir, 'node_modules');
  if (!await isDirMissingOrEmpty(npmModulesPath)) {
    log(`Directory "${npmModulesPath}" exists and has content. Skipping installing dependencies.`);
    return;
  }
  log('Starting dependency installation...');
  const { error } = await runCommand(
    `npm run install-deps -- --no-errors --root-directory ${projectDir}`,
    {
      cwd: projectDir,
    },
  );
  if (error) {
    die(error);
  }
  log('Installed dependencies...');
}

export async function npmBuild(
  projectDir: string,
  buildCommand: string,
  distDir: string,
  forceRebuild: boolean,
): Promise<void> {
  if (!projectDir) { throw new Error('missing project directory'); }
  if (!buildCommand) { throw new Error('missing build command'); }
  if (!distDir) { throw new Error('missing distribution directory'); }

  const isMissingBuild = await isDirMissingOrEmpty(distDir);

  if (!isMissingBuild && !forceRebuild) {
    log(`Directory "${distDir}" exists and has content. Skipping build: '${buildCommand}'.`);
    return;
  }

  if (forceRebuild) {
    log(`Removing directory "${distDir}" for a clean build (triggered by \`--build\` flag).`);
    await rm(distDir, { recursive: true, force: true });
  }

  log('Building project...');
  const { error } = await runCommand(buildCommand, {
    cwd: projectDir,
  });
  if (error) {
    die(error);
  }

  if (await isDirMissingOrEmpty(distDir)) {
    die(`The desktop application build process did not produce the expected artifacts. The output directory "${distDir}" is empty or missing.`);
  }
}

const appNameCache = new Map<string, string>();

export async function getAppName(projectDir: string): Promise<string> {
  if (!projectDir) { throw new Error('missing project directory'); }
  const cachedName = appNameCache.get(projectDir);
  if (cachedName) {
    return cachedName;
  }
  const packageData = await readPackageJsonContents(projectDir);
  try {
    const packageJson = JSON.parse(packageData);
    const name = packageJson.name as string | undefined;
    if (!name) {
      return die(`The \`package.json\` file doesn't specify a name: ${packageData}`);
    }
    appNameCache.set(projectDir, name);
    return name;
  } catch (error) {
    return die(`Unable to parse \`package.json\`. Error: ${error}\nContent: ${packageData}`);
  }
}

async function readPackageJsonContents(projectDir: string): Promise<string> {
  if (!projectDir) { throw new Error('missing project directory'); }
  const packagePath = join(projectDir, 'package.json');
  if (!await exists(packagePath)) {
    return die(`\`package.json\` file not found at ${packagePath}`);
  }
  try {
    const packageData = await readFile(packagePath, 'utf8');
    return packageData;
  } catch (error) {
    log(`Error reading \`package.json\` from ${packagePath}.`, LogLevel.Error);
    return die(`Error detail: ${error}`);
  }
}
