import { ElectronLogger } from '@/infrastructure/Log/ElectronLogger';
import { sleep } from '@/infrastructure/Threading/AsyncSleep';

export interface FileSystemAccessorWithRetry {
  (
    fileOperation: () => Promise<boolean>,
  ): Promise<boolean>;
}

export const retryFileSystemAccess: FileSystemAccessorWithRetry = (
  fileOperation,
) => {
  return retryWithExponentialBackoff(
    fileOperation,
    TOTAL_RETRIES,
    INITIAL_DELAY_MS,
  );
};

// These values provide a balanced approach for handling transient file system
// issues without excessive waiting.
const INITIAL_DELAY_MS = 500;
const TOTAL_RETRIES = 3;

async function retryWithExponentialBackoff(
  operation: () => Promise<boolean>,
  maxAttempts: number,
  delayInMs: number,
  currentAttempt = 1,
): Promise<boolean> {
  const result = await operation();
  if (result || currentAttempt === maxAttempts) {
    return result;
  }
  ElectronLogger.info(`Attempting retry (${currentAttempt}/${TOTAL_RETRIES}) in ${delayInMs} ms.`);
  await sleep(delayInMs);
  const exponentialDelayInMs = delayInMs * 2;
  const nextAttempt = currentAttempt + 1;
  return retryWithExponentialBackoff(
    operation,
    maxAttempts,
    exponentialDelayInMs,
    nextAttempt,
  );
}
