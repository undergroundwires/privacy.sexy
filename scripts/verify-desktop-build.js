/**
 * A script for automating the build, execution, and verification of an Electron distributions.
 * It builds and executes the packages application for a specified duration to check for runtime errors.
 *
 * Usage:
 *  - --build: Clears the electron distribution directory and forces a rebuild of the Electron app.
 */

import { execSync, spawn } from 'child_process';
import { platform } from 'os';
import { existsSync, readdirSync, rmdirSync } from 'fs';

const DESKTOP_BUILD_COMMAND = 'npm run electron:build';
const DESKTOP_DIST_PATH = 'dist_electron';
const NPM_MODULES_PATH = './node_modules';
const APP_EXECUTION_DURATION_IN_SECONDS = 15;
const FORCE_REBUILD = process.argv.includes('--build');

async function main() {
  try {
    npmInstall();
    build();
    const currentPlatform = platform();
    const executor = PLATFORM_EXECUTORS[currentPlatform];
    if (!executor) {
      throw new Error(`Unsupported OS: ${currentPlatform}`);
    }
    const { stderr } = await executor();
    ensureNoErrors(stderr);
    log('Application ran without errors.');
    process.exit(0);
  } catch (error) {
    console.error(error);
    die('Unexpected error');
  }
}

const SUPPORTED_PLATFORMS = {
  MAC: 'darwin',
  LINUX: 'linux',
  WINDOWS: 'win32'
};

const PLATFORM_EXECUTORS = {
  [SUPPORTED_PLATFORMS.MAC]: executeDmg,
  [SUPPORTED_PLATFORMS.LINUX]: executeAppImage,
  [SUPPORTED_PLATFORMS.WINDOWS]: executeMsi,
};

function executeMsi() {
  throw new Error('not yet supported');
}

function isDirMissingOrEmpty(dir) {
  if(!dir) { throw new Error('Missing directory'); }
  return !existsSync(dir)
    || readdirSync(dir).length === 0;
}

function npmInstall() {
  if (!isDirMissingOrEmpty(NPM_MODULES_PATH)) {
    log(`"${NPM_MODULES_PATH}" exists and is not empty, skipping desktop build npm install.`);
    return;
  }
  log(`Installing dependencies...`);
  execSync('npm install', { stdio: 'inherit' });
}

function build() {
  if (FORCE_REBUILD && existsSync(DESKTOP_DIST_PATH)) {
    log(`Clearing "${DESKTOP_DIST_PATH}" for a fresh build due to --build flag.`);
    rmdirSync(DESKTOP_DIST_PATH, { recursive: true });
  }
  if (!isDirMissingOrEmpty(DESKTOP_DIST_PATH)) {
    log(`"${DESKTOP_DIST_PATH}" exists and is not empty, skipping desktop build (${DESKTOP_BUILD_COMMAND}).`);
    return;
  }
  log('Building the project...');
  execSync(DESKTOP_BUILD_COMMAND, { stdio: 'inherit' });
}

function findFileByExtension(extension) {
  const files = execSync(`find ./${DESKTOP_DIST_PATH} -type f -name '*.${extension}'`)
    .toString()
    .trim()
    .split('\n');

  if (!files.length) {
    die(`No ${extension} found in ${DESKTOP_DIST_PATH} directory.`);
  }
  if (files.length > 1) {
    die(`Found multiple ${extension} files: ${files.join(', ')}`);
  }
  return files[0];
}

function executeAppImage() {
  const appFile = findFileByExtension('AppImage');
  makeExecutable(appFile);
  return execute(appFile);
}

function makeExecutable(appFile) {
  if(!appFile) { throw new Error('missing file'); }
  if (isExecutable(appFile)) {
    log('AppImage is already executable.');
    return;
  }
  log('Making it executable...');
  execSync(`chmod +x ${appFile}`);

  function isExecutable(file) {
    try {
      execSync(`test -x ${file}`);
      return true;
    } catch {
      return false;
    }
  }
}

function executeDmg() {
  const filePath = findFileByExtension('dmg');
  const { mountPath } = mountDmg(filePath);
  const appPath = findMacAppExecutablePath(mountPath);

  return execute(appPath).finally(() => {
    tryDetachMount(mountPath);
  });
}

function findMacAppExecutablePath(mountPath) {
  const appFolder = execSync(`find '${mountPath}' -maxdepth 1 -type d -name "*.app"`)
    .toString()
    .trim();
  const appName = appFolder.split('/').pop().replace('.app', '');
  const appPath = `${appFolder}/Contents/MacOS/${appName}`;
  if(existsSync(appPath)) {
    log(`Application is located at ${appPath}`);
  } else {
    die(`Application does not exist at ${appPath}`);
  }
  return appPath;
}

function mountDmg(dmgFile) {
  const hdiutilOutput = execSync(`hdiutil attach '${dmgFile}'`).toString();
  const mountPathMatch = hdiutilOutput.match(/\/Volumes\/[^\n]+/);
  const mountPath = mountPathMatch ? mountPathMatch[0] : null;
  return {
    mountPath,
  };
}

function tryDetachMount(mountPath, retries = 3) {
  while (retries-- > 0) {
    try {
      execSync(`hdiutil detach '${mountPath}'`);
      break;
    } catch (error) {
      if (retries <= 0) {
        console.error(`Failed to detach mount after multiple attempts: ${mountPath}`);
      } else {
        sleep(500);
      }
    }
  }
}
function execute(appFile) {
  if(!appFile) { throw new Error('missing file'); };
  log(`Executing the AppImage for ${APP_EXECUTION_DURATION_IN_SECONDS} seconds to check for errors...`);
  return new Promise((resolve, reject) => {
    let stderrData = '';
    const child = spawn(appFile);

    child.stderr.on('data', (data) => {
      stderrData += data.toString();
    });

    child.on('error', (error) => {
      reject(error);
    });

    setTimeout(() => {
      child.kill();
      resolve({
        stderr: stderrData
      });
    }, APP_EXECUTION_DURATION_IN_SECONDS * 1000);
  });
}

function sleep(milliseconds) {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
}

function ensureNoErrors(stderr) {
  if (stderr && stderr.length > 0) {
    die(`Errors detected while running the AppImage:\n${stderr}`);
  }
}

function log(message) {
  const separator = '======================================';
  const ansiiBold = '\x1b[1m';
  const ansiiReset = '\x1b[0m';
  console.log(`${separator}\n${ansiiBold}${message}${ansiiReset}`);
}

function die(message) {
  const separator = '======================================';
  console.error(`${separator}\n${message}\n${separator}`);
  process.exit(1);
}

await main();
