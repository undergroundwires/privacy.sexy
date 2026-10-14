/**
 * Description:
 *   This script verifies the existence and content of build artifacts based on the
 *   provided CLI flags. It exists with exit code `0` if all verifications pass, otherwise
 *   with exit code `1`.
 *
 * Usage:
 *   node scripts/verify-build-artifacts.js [options]
 *
 * Options:
 *   --electron-unbundled    Verify artifacts for the unbundled Electron application.
 *   --electron-bundled      Verify artifacts for the bundled Electron application.
 *   --web                   Verify artifacts for the web application.
 */

import { access, readdir, readFile } from 'node:fs/promises';
import { relative, resolve } from 'node:path';

const PROCESS_ARGUMENTS = process.argv.slice(2);

async function main() {
  const buildConfigs = getBuildVerificationConfigs();
  if (PROCESS_ARGUMENTS.includes('--help')) {
    console.log(`Usage: node scripts/verify-build-artifacts.js [${Object.keys(buildConfigs).join(' | ')}]`);
    return;
  }
  if (!anyCommandsFound(Object.keys(buildConfigs))) {
    die(`No valid command found in process arguments. Expected one of: ${Object.keys(buildConfigs).join(', ')}`);
  }
  const distDirs = JSON.parse(await readFile(resolve(process.cwd(), 'dist-dirs.json'), 'utf8'));
  /* eslint-disable no-await-in-loop */
  for (const [command, config] of Object.entries(buildConfigs)) {
    if (PROCESS_ARGUMENTS.includes(command)) {
      const distDir = resolve(process.cwd(), distDirs[config.directoryKey]);
      await verifyDirectoryExists(distDir);
      await verifyNonEmptyDirectory(distDir);
      await verifyFilesExist(distDir, config.filePatterns);
    }
  }
  /* eslint-enable no-await-in-loop */
  console.log('✅ Build completed successfully and all expected artifacts are in place.');
  process.exit(0);
}

function getBuildVerificationConfigs() {
  return {
    '--electron-unbundled': {
      directoryKey: 'electronUnbundled',
      filePatterns: [
        /^main[/\\]index\.(cjs|mjs|js)$/,
        /^preload[/\\]index\.(cjs|mjs|js)$/,
        /^renderer[/\\]index\.html?$/,
      ],
    },
    '--electron-bundled': {
      directoryKey: 'electronBundled',
      filePatterns: [
        /^latest.*\.yml$/, // generates latest.yml for auto-updates
        /.*-\d+\.\d+\.\d+\..*/, // a file with extension and semantic version (packaged application)
      ],
    },
    '--web': {
      directoryKey: 'web',
      filePatterns: [
        /^index\.html?$/,
      ],
    },
  };
}

function anyCommandsFound(commands) {
  return PROCESS_ARGUMENTS.some((arg) => commands.includes(arg));
}

async function verifyDirectoryExists(directoryPath) {
  try {
    await access(directoryPath);
  } catch (error) {
    die(`Directory does not exist at \`${directoryPath}\`:\n\t${error.message}`);
  }
}

async function verifyNonEmptyDirectory(directoryPath) {
  const files = await readdir(directoryPath);
  if (files.length === 0) {
    die(`Directory is empty at \`${directoryPath}\``);
  }
}

async function verifyFilesExist(directoryPath, filePatterns) {
  const files = await listAllFilesRecursively(directoryPath);
  for (const pattern of filePatterns) {
    const match = files.some((file) => pattern.test(relative(directoryPath, file)));
    if (!match) {
      die(
        `No file matches the pattern ${pattern.source} in directory \`${directoryPath}\``,
        `\nFiles in directory:\n${files.map((file) => `- ${file}`).join('\n')}`,
      );
    }
  }
}

async function listAllFilesRecursively(directoryPath) {
  const dir = await readdir(directoryPath, { withFileTypes: true });
  const files = await Promise.all(dir.map(async (dirent) => {
    const absolutePath = resolve(directoryPath, dirent.name);
    if (dirent.isDirectory()) {
      return listAllFilesRecursively(absolutePath);
    }
    return absolutePath;
  }));
  return files.flat();
}

function die(...message) {
  console.error(...message);
  process.exit(1);
}

await main();
