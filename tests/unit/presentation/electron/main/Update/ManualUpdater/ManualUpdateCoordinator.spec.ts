import {
  beforeEach, describe, expect, it, vi,
} from 'vitest';
import { startManualUpdateProcess } from '@/presentation/electron/main/Update/ManualUpdater/ManualUpdateCoordinator';
import type { UpdateInfo } from 'electron-updater';

const boundaries = vi.hoisted(() => ({
  openExternal: vi.fn<(url: string) => Promise<void>>(),
  cleanup: vi.fn<() => Promise<void>>(),
  recover: vi.fn<() => Promise<number>>(),
}));

vi.mock('electron', () => ({
  shell: { openExternal: boundaries.openExternal },
  dialog: {},
}));
vi.mock('@/infrastructure/Log/ElectronLogger', () => ({
  ElectronLogger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));
vi.mock('@/presentation/electron/main/Update/ManualUpdater/InstallationFiles/InstallationFileCleaner', () => ({
  clearUpdateInstallationFiles: boundaries.cleanup,
}));
vi.mock('@/presentation/electron/main/Update/ManualUpdater/Dialogs', async (importOriginal) => {
  const dialogs = await importOriginal<typeof import('@/presentation/electron/main/Update/ManualUpdater/Dialogs')>();
  return {
    ...dialogs,
    promptForManualUpdate: async () => dialogs.ManualUpdateChoice.VisitReleasesPage,
    showUnexpectedError: boundaries.recover,
  };
});
vi.mock('@/presentation/electron/main/Update/ProgressBar/UpdateProgressBar', () => ({
  UpdateProgressBar: class {
    public constructor() {
      throw new Error('This test must not create an update window.');
    }
  },
}));
vi.mock('@/presentation/electron/main/Update/ManualUpdater/Downloader', () => ({
  downloadUpdate: () => { throw new Error('This test must not download an installer.'); },
}));
vi.mock('@/presentation/electron/main/Update/ManualUpdater/Installer', () => ({
  startInstallation: () => { throw new Error('This test must not start an installer.'); },
}));
vi.mock('@/presentation/electron/main/Update/ManualUpdater/Integrity', () => ({
  checkIntegrity: () => { throw new Error('This test must not read an installer.'); },
}));

describe('manual update release-page navigation', () => {
  const update: UpdateInfo = {
    version: '0.13.9',
    files: [],
    path: 'unused.dmg',
    sha512: 'unused',
    releaseDate: '2026-09-13T00:00:00Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    boundaries.cleanup.mockResolvedValue(undefined);
    boundaries.recover.mockResolvedValue(0);
  });

  it('offers recovery when the native opener fails', async () => {
    boundaries.openExternal.mockRejectedValue(new Error('Unable to open browser'));

    await startManualUpdateProcess(update);

    expect(boundaries.cleanup).toHaveBeenCalledOnce();
    expect(boundaries.openExternal).toHaveBeenCalledOnce();
    expect(boundaries.recover).toHaveBeenCalledOnce();
  });

  it('does not offer error recovery after successful navigation', async () => {
    boundaries.openExternal.mockResolvedValue(undefined);

    await startManualUpdateProcess(update);

    expect(boundaries.openExternal).toHaveBeenCalledOnce();
    expect(boundaries.recover).not.toHaveBeenCalled();
  });
});
