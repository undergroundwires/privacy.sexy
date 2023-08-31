import { unlink } from 'fs/promises';
import { runCommand } from '../../utils/run-command';
import { log, LogLevel } from '../../utils/log';
import { CURRENT_PLATFORM, SupportedPlatform } from '../../utils/platform';
import { exists } from '../../utils/io';

export async function captureScreen(
  imagePath: string,
): Promise<void> {
  if (!imagePath) {
    throw new Error('Path for screenshot not provided');
  }

  if (await exists(imagePath)) {
    log(`Screenshot file already exists at ${imagePath}. It will be overwritten.`, LogLevel.Warn);
    unlink(imagePath);
  }

  const platformCommands: {
    readonly [K in SupportedPlatform]: string;
  } = {
    [SupportedPlatform.macOS]: `screencapture -x ${imagePath}`,
    [SupportedPlatform.Linux]: `import -window root ${imagePath}`,
    [SupportedPlatform.Windows]: `powershell -NoProfile -EncodedCommand ${encodeForPowershell(getScreenshotPowershellScript(imagePath))}`,
  };

  const commandForPlatform = platformCommands[CURRENT_PLATFORM];

  if (!commandForPlatform) {
    log(`Screenshot capture not supported on: ${SupportedPlatform[CURRENT_PLATFORM]}`, LogLevel.Warn);
    return;
  }

  log(`Capturing screenshot to ${imagePath} using command:\n\t> ${commandForPlatform}`);

  const { error } = await runCommand(commandForPlatform);
  if (error) {
    log(`Failed to capture screenshot.\n${error}`, LogLevel.Warn);
    return;
  }
  log(`Captured screenshot to ${imagePath}.`);
}

function getScreenshotPowershellScript(imagePath: string): string {
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

function encodeForPowershell(script: string): string {
  const buffer = Buffer.from(script, 'utf16le');
  return buffer.toString('base64');
}
