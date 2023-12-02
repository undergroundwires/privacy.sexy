import { autoUpdater, UpdateInfo } from 'electron-updater';
import { ElectronLogger } from '@/infrastructure/Log/ElectronLogger';
import { handleManualUpdate, requiresManualUpdate } from './ManualUpdater';
import { handleAutoUpdate } from './AutoUpdater';

interface IUpdater {
  checkForUpdates(): Promise<void>;
}

export function setupAutoUpdater(): IUpdater {
  autoUpdater.logger = ElectronLogger;

  // Disable autodownloads because "checking" and "downloading" are handled separately based on the
  // current platform and user's choice.
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
    await handleManualUpdate(info);
    return;
  }
  await handleAutoUpdate();
}
