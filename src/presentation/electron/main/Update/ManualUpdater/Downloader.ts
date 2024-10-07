import { createWriteStream, type WriteStream } from 'node:fs';
import { ElectronLogger } from '@/infrastructure/Log/ElectronLogger';
import type { Logger } from '@/application/Common/Log/Logger';
import { UpdateProgressBar } from '../ProgressBar/UpdateProgressBar';
import { provideUpdateInstallationFilepath, type InstallationFilepathProvider } from './InstallationFiles/InstallationFilepathProvider';
import type { UpdateInfo } from 'electron-updater';
import type { ReadableStream } from 'node:stream/web';

const MAX_PROGRESS_LOG_ENTRIES = 10;
const UNKNOWN_SIZE_LOG_INTERVAL_BYTES = 10 * 1024 * 1024; // 10 MB

export type DownloadUpdateResult = {
  readonly success: false;
} | {
  readonly success: true;
  readonly installerPath: string;
};

interface UpdateDownloadUtilities {
  readonly logger: Logger;
  readonly provideInstallationFilePath: InstallationFilepathProvider;
}

export async function downloadUpdate(
  info: UpdateInfo,
  remoteFileUrl: string,
  progressBar: UpdateProgressBar,
  utilities: UpdateDownloadUtilities = DefaultUtilities,
): Promise<DownloadUpdateResult> {
  utilities.logger.info('Starting manual update download.');
  progressBar.showIndeterminateState();
  try {
    const { filePath } = await downloadInstallerFile(
      info.version,
      remoteFileUrl,
      (percentage) => { progressBar.showPercentage(percentage); },
      utilities,
    );
    return {
      success: true,
      installerPath: filePath,
    };
  } catch (e) {
    progressBar.showError(e);
    return {
      success: false,
    };
  }
}

async function downloadInstallerFile(
  version: string,
  remoteFileUrl: string,
  progressHandler: ProgressCallback,
  utilities: UpdateDownloadUtilities,
): Promise<{ readonly filePath: string; }> {
  const filePath = await utilities.provideInstallationFilePath(version);
  await downloadFileWithProgress(
    remoteFileUrl,
    filePath,
    progressHandler,
    utilities,
  );
  return { filePath };
}

type ProgressCallback = (progress: number) => void;

async function downloadFileWithProgress(
  url: string,
  filePath: string,
  progressHandler: ProgressCallback,
  utilities: UpdateDownloadUtilities,
) {
  utilities.logger.info(`Retrieving update from ${url}.`);
  const response = await fetch(url);
  if (!response.ok) {
    throw Error(`Download failed: Server responded with ${response.status} ${response.statusText}.`);
  }
  const contentLength = getContentLengthFromResponse(response, utilities);
  await withWriteStream(filePath, async (writer) => {
    utilities.logger.info(contentLength.isValid
      ? `Saving file to '${filePath}' (Size: ${contentLength.totalLength} bytes).`
      : `Saving file to '${filePath}'.`);
    await withReadableStream(response, async (reader) => {
      await streamWithProgress(contentLength, reader, writer, progressHandler, utilities);
    });
    ElectronLogger.info(`Successfully saved the file: '${filePath}'`);
  });
}

type ResponseContentLength = {
  readonly isValid: true;
  readonly totalLength: number;
} | {
  readonly isValid: false;
};

function getContentLengthFromResponse(
  response: Response,
  utilities: UpdateDownloadUtilities,
): ResponseContentLength {
  const contentLengthString = response.headers.get('content-length');
  const headersInfo = Array.from(response.headers.entries());
  if (!contentLengthString) {
    utilities.logger.warn('Missing \'Content-Length\' header in the response.', headersInfo);
    return { isValid: false };
  }
  const contentLength = Number(contentLengthString);
  if (Number.isNaN(contentLength) || contentLength <= 0) {
    utilities.logger.error('Unable to determine download size from server response.', headersInfo);
    return { isValid: false };
  }
  return { totalLength: contentLength, isValid: true };
}

async function withReadableStream(
  response: Response,
  handler: (readStream: ReadableStream) => Promise<void>,
) {
  const reader = createReader(response);
  try {
    await handler(reader);
  } finally {
    reader.cancel();
  }
}

async function withWriteStream(
  filePath: string,
  handler: (writeStream: WriteStream) => Promise<void>,
) {
  const writer = createWriteStream(filePath);
  try {
    await handler(writer);
  } finally {
    writer.end();
  }
}

async function streamWithProgress(
  contentLength: ResponseContentLength,
  readStream: ReadableStream,
  writeStream: WriteStream,
  progressHandler: ProgressCallback,
  utilities: UpdateDownloadUtilities,
): Promise<void> {
  let receivedLength = 0;
  let logThreshold = 0;
  for await (const chunk of readStream) {
    if (!chunk) {
      throw Error('Received empty data chunk during download.');
    }
    writeStream.write(Buffer.from(chunk));
    receivedLength += chunk.length;
    notifyProgress(contentLength, receivedLength, progressHandler);
    const progressLog = logProgress(receivedLength, contentLength, logThreshold, utilities);
    logThreshold = progressLog.nextLogThreshold;
  }
  utilities.logger.info('Update download completed successfully.');
}

function logProgress(
  receivedLength: number,
  contentLength: ResponseContentLength,
  logThreshold: number,
  utilities: UpdateDownloadUtilities,
): { readonly nextLogThreshold: number; } {
  const {
    shouldLog, nextLogThreshold,
  } = shouldLogProgress(receivedLength, contentLength, logThreshold);
  if (shouldLog) {
    utilities.logger.debug(`Download progress: ${receivedLength} bytes received.`);
  }
  return { nextLogThreshold };
}

function notifyProgress(
  contentLength: ResponseContentLength,
  receivedLength: number,
  progressHandler: ProgressCallback,
) {
  if (!contentLength.isValid) {
    return;
  }
  const percentage = Math.floor((receivedLength / contentLength.totalLength) * 100);
  progressHandler(percentage);
}

function shouldLogProgress(
  receivedLength: number,
  contentLength: ResponseContentLength,
  previousLogThreshold: number,
): { shouldLog: boolean, nextLogThreshold: number } {
  const logInterval = contentLength.isValid
    ? Math.ceil(contentLength.totalLength / MAX_PROGRESS_LOG_ENTRIES)
    : UNKNOWN_SIZE_LOG_INTERVAL_BYTES;

  if (receivedLength >= previousLogThreshold + logInterval) {
    return { shouldLog: true, nextLogThreshold: previousLogThreshold + logInterval };
  }
  return { shouldLog: false, nextLogThreshold: previousLogThreshold };
}

function createReader(response: Response): ReadableStream {
  if (!response.body) {
    throw new Error('Response body is empty, cannot proceed with download.');
  }
  // TypeScript has removed the async iterator type definition for ReadableStream due to
  // limited browser support. Node.js, however, supports async iterable streams, allowing
  // type casting to function properly in this context.
  // https://github.com/DefinitelyTyped/DefinitelyTyped/discussions/65542#discussioncomment-6071004
  return response.body as ReadableStream;
}

const DefaultUtilities: UpdateDownloadUtilities = {
  logger: ElectronLogger,
  provideInstallationFilePath: provideUpdateInstallationFilepath,
};
