import { autoUpdater, UpdateInfo } from 'electron-updater';
import log from 'electron-log';
import { handleManualUpdateAsync, requiresManualUpdate } from './ManualUpdater';
import { handleAutoUpdateAsync } from './AutoUpdater';

interface IUpdater {
    checkForUpdatesAsync(): Promise<void>;
}

export function setupAutoUpdater(): IUpdater {
    autoUpdater.logger = log;
    autoUpdater.autoDownload = false; // Checking and downloading are handled separately based on platform/user choice
    autoUpdater.on('error', (error: Error) => {
        log.error('@error@\n', error);
    });
    let isAlreadyHandled = false;
    autoUpdater.on('update-available', async (info: UpdateInfo) => {
        log.info('@update-available@\n', info);
        if (isAlreadyHandled) {
            log.info('Available updates is already handled');
            return;
        }
        isAlreadyHandled = true;
        await handleAvailableUpdateAsync(info);
    });
    return {
        checkForUpdatesAsync: async () => {
            // autoUpdater.emit('update-available'); // For testing
            await autoUpdater.checkForUpdates();
        },
    };
}

async function handleAvailableUpdateAsync(info: UpdateInfo) {
    if (requiresManualUpdate()) {
        await handleManualUpdateAsync(info);
        return;
    }
    await handleAutoUpdateAsync();
}
