import { app, BrowserWindow, dialog } from 'electron/main';
import { ElectronLogger } from '@/infrastructure/Log/ElectronLogger';
import {
  RENDERER_HTML_PATH, RENDERER_DEV_SERVER_URL,
  IS_DEVELOPMENT,
} from './ElectronConfig';

const OPEN_DEV_TOOLS_ON_DEVELOPMENT = true;

export async function loadWindowContents(
  window: BrowserWindow,
): Promise<void> {
  if (IS_DEVELOPMENT) {
    await loadDevServer(window);
  } else {
    await loadPackagedFile(window);
  }
  openDevTools(window);
  // Do not remove [WINDOW_INIT]; it's a marker used in tests.
  ElectronLogger.info('[WINDOW_INIT] Main window initialized and content loading.');
}

function openDevTools(
  window: BrowserWindow,
): void {
  if (!IS_DEVELOPMENT) {
    return;
  }
  if (!OPEN_DEV_TOOLS_ON_DEVELOPMENT) {
    return;
  }
  try {
    window.webContents.openDevTools();
  } catch (err: unknown) {
    // DevTools are a development aid only, log failures without interrupting application flow
    ElectronLogger.error('Failed to open DevTools', err);
  }
}

function truncateMiddle(
  text: string,
  maxLength: number,
  separator: string = '...',
): string {
  if (text.length <= maxLength) {
    return text;
  }
  const charsToShow = maxLength - separator.length;
  const totalFrontChars = Math.ceil(charsToShow / 2);
  const totalEndChars = Math.floor(charsToShow / 2);
  return [
    text.slice(0, totalFrontChars),
    text.slice(-totalEndChars),
  ].join(separator);
}

async function loadDevServer(
  window: BrowserWindow,
): Promise<void> {
  const devServerUrl = RENDERER_DEV_SERVER_URL;
  if (!devServerUrl || devServerUrl.length === 0) {
    throw new Error('Developer server URL is not populated during bundling');
  }
  try {
    await window.loadURL(devServerUrl);
  } catch (error) {
    showLoadErrorAndExit({
      technicalSummary: `${truncateMiddle(devServerUrl, 20)} (URL)`,
      logMessage: `Failed to load URL: ${devServerUrl}`,
    });
  }
}

async function loadPackagedFile(
  window: BrowserWindow,
): Promise<void> {
  const filePath = RENDERER_HTML_PATH;
  try {
    await window.loadFile(filePath);
  } catch {
    showLoadErrorAndExit({
      technicalSummary: `${truncateMiddle(filePath, 20)} (file)`,
      logMessage: `Failed to load file: ${filePath}`,
    });
  }
}

interface LoadErrorDetails {
  readonly technicalSummary: string;
  readonly logMessage: string;
}

function showLoadErrorAndExit(errorDetails: LoadErrorDetails): void {
  ElectronLogger.error(errorDetails.logMessage);
  dialog.showErrorBox(
    'Error: Application Failed to Load',
    [
      'Please try:',
      '1. Restart the application',
      '2. Reinstall the application',
      '\n',
      'If the problem persists, report this as issue with the information below:',
      `Reference: ${errorDetails.technicalSummary}`,
    ].join('\n'),
  );
  app.exit(1);
}
