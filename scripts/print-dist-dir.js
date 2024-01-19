/**
 * Description:
 *   This script determines the absolute path of a distribution directory based on CLI arguments
 *   and outputs its absolute path. It is designed to be run programmatically by other scripts.
 *
 * Usage:
 *   node scripts/print-dist-dir.js [options]
 *
 * Options:
 *   --electron-unbundled   Path for the unbundled Electron application
 *   --electron-bundled     Path for the bundled Electron application
 *   --web                  Path for the web application
 */

import { resolve } from 'node:path';
import { readFile } from 'node:fs/promises';

const DIST_DIRS_JSON_FILE_PATH = resolve(process.cwd(), 'dist-dirs.json'); // cannot statically import because ESLint does not support it https://github.com/eslint/eslint/discussions/15305
const CLI_ARGUMENTS = process.argv.slice(2);

async function main() {
  const distDirs = await readDistDirsJsonFile(DIST_DIRS_JSON_FILE_PATH);
  const relativeDistDir = determineRelativeDistDir(distDirs, CLI_ARGUMENTS);
  const absoluteDistDir = resolve(process.cwd(), relativeDistDir);
  console.log(absoluteDistDir);
}

function mapCliFlagsToDistDirs(distDirs) {
  return {
    '--electron-unbundled': distDirs.electronUnbundled,
    '--electron-bundled': distDirs.electronBundled,
    '--web': distDirs.web,
  };
}

function determineRelativeDistDir(distDirsJsonObject, cliArguments) {
  const cliFlagDistDirMap = mapCliFlagsToDistDirs(distDirsJsonObject);
  const availableCliFlags = Object.keys(cliFlagDistDirMap);
  const requestedCliFlags = cliArguments.filter((arg) => {
    return availableCliFlags.includes(arg);
  });
  if (!requestedCliFlags.length) {
    throw new Error(`No distribution directory was requested. Please use one of these flags: ${availableCliFlags.join(', ')}`);
  }
  if (requestedCliFlags.length > 1) {
    throw new Error(`Multiple distribution directories were requested, but this script only supports one: ${requestedCliFlags.join(', ')}`);
  }
  const selectedCliFlag = requestedCliFlags[0];
  return cliFlagDistDirMap[selectedCliFlag];
}

async function readDistDirsJsonFile(absoluteConfigJsonFilePath) {
  const fileContentAsText = await readFile(absoluteConfigJsonFilePath, 'utf8');
  const parsedJsonData = JSON.parse(fileContentAsText);
  return parsedJsonData;
}

await main();
