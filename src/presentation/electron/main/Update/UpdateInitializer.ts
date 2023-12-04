import { autoUpdater, UpdateInfo } from 'electron-updater';
import { ElectronLogger } from '@/infrastructure/Log/ElectronLogger';
import { requiresManualUpdate, startManualUpdateProcess } from './ManualUpdater/ManualUpdateCoordinator';
import { handleAutoUpdate } from './AutomaticUpdateCoordinator';

interface Updater {
  checkForUpdates(): Promise<void>;
}

export function setupAutoUpdater(): Updater {
  autoUpdater.logger = ElectronLogger;

  // Auto-downloads are disabled to allow separate handling of 'check' and 'download' actions,
  // which vary based on the specific platform and user preferences.
  autoUpdater.autoDownload = false;

  autoUpdater.on('error', (error: Error) => {
    ElectronLogger.error('@error@\n', error);
  });

  let isAlreadyHandled = false;
  autoUpdater.on('update-available', async (info: UpdateInfo) => {
    ElectronLogger.info('@update-available@\n', info);
    if (isAlreadyHandled) {
      ElectronLogger.info('Available updates is already handled');
      return;
    }
    isAlreadyHandled = true;
    await handleAvailableUpdate(info);
  });

  return {
    checkForUpdates: async () => {
      // autoUpdater.emit('update-available'); // For testing
      await autoUpdater.checkForUpdates();
    },
  };
}

async function handleAvailableUpdate(info: UpdateInfo) {
  if (requiresManualUpdate()) {
    await startManualUpdateProcess(info);
    return;
  }
  await handleAutoUpdate();
}
