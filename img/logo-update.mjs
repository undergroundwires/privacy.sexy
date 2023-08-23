#!/usr/bin/env bash
import { resolve, join } from 'path';
import { rm, mkdtemp, stat } from 'fs/promises';
import { spawn } from 'child_process';
import { URL, fileURLToPath } from 'url';

class Paths {
  constructor(selfDirectory) {
    const projectRoot = resolve(selfDirectory, '../');
    this.sourceImage = join(projectRoot, 'img/logo.svg');
    this.publicDirectory = join(projectRoot, 'public');
    this.electronBuildDirectory = join(projectRoot, 'build');
  }

  toString() {
    return `Source image: ${this.sourceImage}\n`
      + `Public directory: ${this.publicDirectory}\n`
      + `Electron build directory: ${this.electronBuildDirectory}`;
  }
}

async function main() {
  const paths = new Paths(getCurrentScriptDirectory());
  console.log(`Paths:\n\t${paths.toString().replaceAll('\n', '\n\t')}`);
  await updateDesktopLauncherAndTrayIcon(paths.sourceImage, paths.publicDirectory);
  await updateWebFavicon(paths.sourceImage, paths.publicDirectory);
  await updateDesktopIcons(paths.sourceImage, paths.electronBuildDirectory);
  console.log('🎉 (Re)created icons successfully.');
}

async function updateDesktopLauncherAndTrayIcon(sourceImage, publicFolder) {
  await ensureFileExists(sourceImage);
  await ensureFolderExists(publicFolder);
  const electronTrayIconFile = join(publicFolder, 'icon.png');
  console.log(`Updating desktop launcher and tray icon at ${electronTrayIconFile}.`);
  await runCommand(
    'npx',
    'svgexport',
    sourceImage,
    electronTrayIconFile,
  );
}

async function updateWebFavicon(sourceImage, faviconFolder) {
  console.log('Updating favicon');
  await ensureFileExists(sourceImage);
  await ensureFolderExists(faviconFolder);
  await runCommand(
    'npx',
    'icon-gen',
    `--input ${sourceImage}`,
    `--output ${faviconFolder}`,
    '--ico',
    '--ico-name \'favicon\'',
    '--report',
  );
}

async function updateDesktopIcons(sourceImage, electronIconsDir) {
  await ensureFileExists(sourceImage);
  await ensureFolderExists(electronIconsDir);
  const temporaryDir = await mkdtemp('icon-');
  const temporaryPngFile = join(temporaryDir, 'icon.png');
  console.log(`Converting from SVG (${sourceImage}) to PNG: ${temporaryPngFile}`) // required by icon-builder
  await runCommand(
    'npx',
    'svgexport',
    sourceImage,
    temporaryPngFile,
    '1024:1024',
  );
  console.log(`Creating electron icons to ${electronIconsDir}.`);
  await runCommand(
    'npx',
    'electron-icon-builder',
    `--input="${temporaryPngFile}"`,
    `--output="${electronIconsDir}"`,
    '--flatten',
  );
  console.log('Cleaning up temporary directory.');
  await rm(temporaryDir, { recursive: true, force: true });
}

async function ensureFileExists(filePath) {
  const path = await stat(filePath);
  if (!path.isFile()) {
    throw new Error(`Not a file: ${filePath}`);
  }
}

async function ensureFolderExists(folderPath) {
  const path = await stat(folderPath);
  if (!path.isDirectory()) {
    throw new Error(`Not a directory: ${folderPath}`);
  }
}

async function runCommand(...args) {
  const command = args.join(' ');
  console.log(`Running command: ${command}`);
  await new Promise((resolve, reject) => {
    const process = spawn(command, { shell: true });
    process.stdout.on('data', (stdout) => {
      console.log(stdout.toString());
    });
    process.stderr.on('data', (stderr) => {
      console.error(stderr.toString());
    });
    process.on('error', (err) => {
      reject(err);
    });
    process.on('close', (exitCode) => {
      if (exitCode !== 0) {
        reject(new Error(`Process exited with non-zero exit code: ${exitCode}`));
      } else {
        resolve();
      }
      process.stdin.end();
    });
  });
}

function getCurrentScriptDirectory() {
  return fileURLToPath(new URL('.', import.meta.url));
}

await main();
