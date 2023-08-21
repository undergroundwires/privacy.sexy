import { unlink } from 'fs/promises';
import { runCommand } from '../../utils/run-command.js';
import { log, LOG_LEVELS } from '../../utils/log.js';
import { CURRENT_PLATFORM, SUPPORTED_PLATFORMS } from '../../utils/platform.js';
import { exists } from '../../utils/io.js';

export async function captureScreen(imagePath) {
  if (!imagePath) {
    throw new Error('Path for screenshot not provided');
  }

  if (await exists(imagePath)) {
    log(`Screenshot file already exists at ${imagePath}. It will be overwritten.`, LOG_LEVELS.WARN);
    unlink(imagePath);
  }

  const platformCommands = {
    [SUPPORTED_PLATFORMS.MAC]: `screencapture -x ${imagePath}`,
    [SUPPORTED_PLATFORMS.LINUX]: `import -window root ${imagePath}`,
    [SUPPORTED_PLATFORMS.WINDOWS]: `powershell -NoProfile -EncodedCommand ${encodeForPowershell(getScreenshotPowershellScript(imagePath))}`,
  };

  const commandForPlatform = platformCommands[CURRENT_PLATFORM];

  if (!commandForPlatform) {
    log(`Screenshot capture not supported on: ${CURRENT_PLATFORM}`, LOG_LEVELS.WARN);
    return;
  }

  log(`Capturing screenshot to ${imagePath} using command:\n\t> ${commandForPlatform}`);

  const { error } = await runCommand(commandForPlatform);
  if (error) {
    log(`Failed to capture screenshot.\n${error}`, LOG_LEVELS.WARN);
    return;
  }
  log(`Captured screenshot to ${imagePath}.`);
}

function getScreenshotPowershellScript(imagePath) {
  return `
    $ProgressPreference = 'SilentlyContinue' # Do not pollute stderr
    Add-Type -AssemblyName System.Windows.Forms
    $screenBounds = [System.Windows.Forms.Screen]::PrimaryScreen.Bounds

    $bmp = New-Object System.Drawing.Bitmap $screenBounds.Width, $screenBounds.Height
    $graphics = [System.Drawing.Graphics]::FromImage($bmp)
    $graphics.CopyFromScreen([System.Drawing.Point]::Empty, [System.Drawing.Point]::Empty, $screenBounds.Size)

    $bmp.Save('${imagePath}')
    $graphics.Dispose()
    $bmp.Dispose()
  `;
}

function encodeForPowershell(script) {
  const buffer = Buffer.from(script, 'utf-16le');
  return buffer.toString('base64');
}
