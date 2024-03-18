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

import { access, readdir } from 'node:fs/promises';
import { exec } from 'node:child_process';
import { resolve } from 'node:path';

const PROCESS_ARGUMENTS = process.argv.slice(2);
const PRINT_DIST_DIR_SCRIPT_BASE_COMMAND = 'node scripts/print-dist-dir';

async function main() {
  const buildConfigs = getBuildVerificationConfigs();
  if (!anyCommandsFound(Object.keys(buildConfigs))) {
    die(`No valid command found in process arguments. Expected one of: ${Object.keys(buildConfigs).join(', ')}`);
  }
  /* eslint-disable no-await-in-loop */
  for (const [command, config] of Object.entries(buildConfigs)) {
    if (PROCESS_ARGUMENTS.includes(command)) {
      const distDir = await executePrintDistDirScript(config.printDistDirScriptArgument);
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
      printDistDirScriptArgument: '--electron-unbundled',
      filePatterns: [
        /main[/\\]index\.(cjs|mjs|js)/,
        /preload[/\\]index\.(cjs|mjs|js)/,
        /renderer[/\\]index\.htm(l)?/,
      ],
    },
    '--electron-bundled': {
      printDistDirScriptArgument: '--electron-bundled',
      filePatterns: [
        /latest.*\.yml/, // generates latest.yml for auto-updates
        /.*-\d+\.\d+\.\d+\..*/, // a file with extension and semantic version (packaged application)
      ],
    },
    '--web': {
      printDistDirScriptArgument: '--web',
      filePatterns: [
        /index\.htm(l)?/,
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
    const match = files.some((file) => pattern.test(file));
    if (!match) {
      die(
        `No file matches the pattern ${pattern.source} in directory \`${directoryPath}\``,
        `\nFiles in directory:\n${files.map((file) => `\t- ${file}`).join('\n')}`,
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

async function executePrintDistDirScript(flag) {
  return new Promise((resolve, reject) => {
    const commandToRun = `${PRINT_DIST_DIR_SCRIPT_BASE_COMMAND} ${flag}`;

    exec(commandToRun, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(`Execution failed with error: ${error}`));
      } else if (stderr) {
        reject(new Error(`Execution failed with stderr: ${stderr}`));
      } else {
        resolve(stdout.trim());
      }
    });
  });
}

function die(...message) {
  console.error(...message);
  process.exit(1);
}

await main();
