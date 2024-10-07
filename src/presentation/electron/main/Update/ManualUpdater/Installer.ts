import { app } from 'electron/main';
import { shell } from 'electron/common';
import { ElectronLogger } from '@/infrastructure/Log/ElectronLogger';
import { retryFileSystemAccess } from './FileSystemAccessorWithRetry';

export async function startInstallation(filePath: string): Promise<boolean> {
  return retryFileSystemAccess(async () => {
    ElectronLogger.info(`Attempting to open the installer at: ${filePath}.`);
    const error = await shell.openPath(filePath);
    if (!error) {
      app.quit();
      return true;
    }
    ElectronLogger.error(`Failed to open the installer at ${filePath}.`, error);
    return false;
  });
}
