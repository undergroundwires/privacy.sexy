import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { ElectronLogger } from '@/infrastructure/Log/ElectronLogger';
import { retryFileSystemAccess } from './FileSystemAccessorWithRetry';

export async function checkIntegrity(
  filePath: string,
  base64Sha512: string,
): Promise<boolean> {
  return retryFileSystemAccess(
    async () => {
      const hash = await computeSha512(filePath);
      if (hash === base64Sha512) {
        ElectronLogger.info(`Integrity check passed for file: ${filePath}.`);
        return true;
      }
      ElectronLogger.warn([
        `Integrity check failed for file: ${filePath}`,
        `Expected hash: ${base64Sha512}, but found: ${hash}`,
      ].join('\n'));
      return false;
    },
  );
}

async function computeSha512(filePath: string): Promise<string> {
  try {
    const hash = createHash('sha512');
    const stream = createReadStream(filePath);
    for await (const chunk of stream) {
      hash.update(chunk);
    }
    return hash.digest('base64');
  } catch (error) {
    ElectronLogger.error(`Failed to compute SHA512 hash for file: ${filePath}`, error);
    throw error; // Rethrow to handle it in the calling context if necessary
  }
}
