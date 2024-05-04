/**
 * Description:
 *  This script updates the logo images across the project based on the primary
 *  logo file ('img/logo.svg' file).
 *
 *  It handles the creation and update of various icon sizes for different purposes,
 *  including desktop launcher icons, tray icons, and web favicons from a single source
 *  SVG logo file.
 *
 * Usage:
 *    node ./scripts/logo-update.js
 *
 * Notes:
 *    ImageMagick must be installed and accessible in the system's PATH
 */

import { resolve, join, dirname } from 'node:path';
import { stat } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { URL, fileURLToPath } from 'node:url';
import electronBuilderConfig from '../electron-builder.cjs';

class ImageAssetPaths {
  constructor(currentScriptDirectory) {
    const projectRoot = resolve(currentScriptDirectory, '../');
    this.sourceImage = join(projectRoot, 'img/logo.svg');
    this.publicDirectory = join(projectRoot, 'src/presentation/public');
    this.electronBuildResourcesDirectory = electronBuilderConfig.directories.buildResources;
  }

  get electronTrayIconFile() {
    return join(this.publicDirectory, 'icon.png');
  }

  get webFaviconFile() {
    return join(this.publicDirectory, 'favicon.ico');
  }

  toString() {
    return `Source image: ${this.sourceImage}`
      + `\nPublic directory: ${this.publicDirectory}`
      + `\n\t Electron tray icon file: ${this.electronTrayIconFile}`
      + `\n\t Web favicon file: ${this.webFaviconFile}`
      + `\nElectron build directory: ${this.electronBuildResourcesDirectory}`;
  }
}

async function main() {
  const paths = new ImageAssetPaths(getCurrentScriptDirectory());
  console.log(`Paths:\n\t${paths.toString().replaceAll('\n', '\n\t')}`);
  const convertCommand = await findAvailableImageMagickCommand();
  await generateDesktopAndTrayIcons(
    paths.sourceImage,
    paths.electronTrayIconFile,
    convertCommand,
  );
  await generateWebFavicon(
    paths.sourceImage,
    paths.webFaviconFile,
    convertCommand,
  );
  await generateDesktopIcons(
    paths.sourceImage,
    paths.electronBuildResourcesDirectory,
    convertCommand,
  );
  console.log('🎉 (Re)created icons successfully.');
}

async function generateDesktopAndTrayIcons(sourceImage, targetFile, convertCommand) {
  // Reference: https://web.archive.org/web/20240502124306/https://www.electronjs.org/docs/latest/api/tray
  console.log(`Updating desktop launcher and tray icon at ${targetFile}.`);
  await ensureFileExists(sourceImage);
  await ensureParentFolderExists(targetFile);
  await convertFromSvgToPng(
    convertCommand,
    sourceImage,
    targetFile,
    '512x512',
  );
}

async function generateWebFavicon(sourceImage, faviconFilePath, convertCommand) {
  console.log(`Updating favicon at ${faviconFilePath}.`);
  await ensureFileExists(sourceImage);
  await ensureParentFolderExists(faviconFilePath);
  await convertFromSvgToIco(
    convertCommand,
    sourceImage,
    faviconFilePath,
    [16, 24, 32, 48, 64, 128, 256],
  );
}

async function generateDesktopIcons(sourceImage, electronBuildResourcesDirectory, convertCommand) {
  console.log(`Creating Electron icon files to ${electronBuildResourcesDirectory}.`);
  // Reference: https://web.archive.org/web/20240501103645/https://www.electron.build/icons.html
  await ensureFolderExists(electronBuildResourcesDirectory);
  await ensureFileExists(sourceImage);
  const electronMainIconFile = join(electronBuildResourcesDirectory, 'icon.png');
  await convertFromSvgToPng(
    convertCommand,
    sourceImage,
    electronMainIconFile,
    '1024x1024', // Should be at least 512x512
  );
  // Relying on `electron-builder`s conversion from png to ico results in pixelated look on Windows
  // 10 and 11 according to tests, see:
  //  - https://web.archive.org/web/20240502114650/https://github.com/electron-userland/electron-builder/issues/7328
  //  - https://web.archive.org/web/20240502115448/https://github.com/electron-userland/electron-builder/issues/3867
  const electronWindowsIconFile = join(electronBuildResourcesDirectory, 'icon.ico');
  await convertFromSvgToIco(
    convertCommand,
    sourceImage,
    electronWindowsIconFile,
    [16, 24, 32, 48, 64, 128, 256],
  );
}

async function ensureFileExists(filePath) {
  const path = await stat(filePath);
  if (!path.isFile()) {
    throw new Error(`Not a file: ${filePath}`);
  }
}

async function ensureFolderExists(folderPath) {
  if (!folderPath) {
    throw new Error('Path is missing');
  }
  const path = await stat(folderPath);
  if (!path.isDirectory()) {
    throw new Error(`Not a directory: ${folderPath}`);
  }
}

function ensureParentFolderExists(filePath) {
  return ensureFolderExists(dirname(filePath));
}

const BaseImageMagickConvertArguments = Object.freeze([
  '-background none', // Transparent, so they do not get filled with white.
  '-strip', // Strip metadata.
  '-gravity Center', // Center the image when there's empty space
]);

async function convertFromSvgToIco(
  convertCommand,
  inputFile,
  outputFile,
  sizes,
) {
  await runCommand(
    convertCommand,
    ...BaseImageMagickConvertArguments,
    `-density ${Math.max(...sizes).toString()}`, // High enough for sharpness
    `-define icon:auto-resize=${sizes.map((s) => s.toString()).join(',')}`, // Automatically store multiple sizes in an ico image
    '-compress None',
    inputFile,
    outputFile,
  );
}

async function convertFromSvgToPng(
  convertCommand,
  inputFile,
  outputFile,
  size = undefined,
) {
  await runCommand(
    convertCommand,
    ...BaseImageMagickConvertArguments,
    ...(size === undefined ? [] : [
      `-resize ${size}`,
      `-density ${size}`, // High enough for sharpness
    ]),
    inputFile,
    outputFile,
  );
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

async function findAvailableImageMagickCommand() {
  // Reference: https://web.archive.org/web/20240502120041/https://imagemagick.org/script/convert.php
  const potentialBaseCommands = [
    'convert', // Legacy command, usually available on Linux/macOS installations
    'magick convert', // Newer command, available on Windows installations
  ];
  for (const baseCommand of potentialBaseCommands) {
    const testCommand = `${baseCommand} -version`;
    try {
      await runCommand(testCommand); // eslint-disable-line no-await-in-loop
      console.log(`Confirmed: ImageMagick command '${baseCommand}' is available and operational.`);
      return baseCommand;
    } catch (err) {
      console.log(`Error: The command '${baseCommand}' is not found or failed to execute. Detailed error: ${err.message}"`);
    }
  }
  throw new Error([
    'Unable to locate any operational ImageMagick command.',
    `Attempted commands were: ${potentialBaseCommands.join(', ')}.`,
    'Please ensure ImageMagick is correctly installed and accessible.',
  ].join('\n'));
}

await main();
