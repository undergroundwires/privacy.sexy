import { app } from 'electron/main';
import { ElectronLogger } from '@/infrastructure/Log/ElectronLogger';
import type { Logger } from '@/application/Common/Log/Logger';
import { ElectronProgressBarWithLifecycle } from './ElectronProgressBarWithLifecycle';
import type { ProgressInfo } from 'electron-builder';
import type { InitialProgressBarWindowOptions, ProgressBarWithLifecycle } from './ProgressBarWithLifecycle';

export class UpdateProgressBar {
  private visibilityState: ProgressBarVisibilityState = 'closed';

  constructor(
    private readonly logger: Logger = ElectronLogger,
    private readonly currentApp: Electron.App = app,
    private readonly progressBar: ProgressBarWithLifecycle = new ElectronProgressBarWithLifecycle(),
  ) {
    this.progressBar.statusChanged.on((status) => {
      if (status === 'closed') {
        this.visibilityState = 'closed';
      }
    });
  }

  public get isOpen(): boolean {
    return this.visibilityState !== 'closed';
  }

  public showIndeterminateState() {
    if (this.visibilityState === 'showingIndeterminate') {
      return;
    }
    this.progressBar.resetAndOpen(createInitialProgressBarWindowOptions('indeterminate', this.currentApp.name));
    this.visibilityState = 'showingIndeterminate';
  }

  public showProgress(progress: ProgressInfo) {
    const percentage = getUpdatePercent(progress);
    this.showPercentage(percentage);
  }

  public showPercentage(percentage: number) {
    if (this.visibilityState !== 'showingPercentile') {
      this.progressBar.resetAndOpen(createInitialProgressBarWindowOptions('percentile', this.currentApp.name));
      this.visibilityState = 'showingPercentile';
    }
    this.progressBar.update((bar) => {
      bar.setProgress(percentage);
      bar.setText(`${percentage}% ...`);
    });
  }

  public showError(e: Error) {
    this.logger.warn(`Error displayed in progress bar. Visibility state: ${this.visibilityState}. Error message: ${e.message}`);
    if (this.visibilityState === 'closed') {
      throw new Error('Cannot display error because the progress bar is not visible.');
    }
    this.progressBar.update((bar) => {
      bar.setText('An error occurred while downloading updates.'
        + `\n${e && e.message ? e.message : e}`);
      bar.setClosable(true);
    });
  }

  public closeIfOpen() {
    if (this.visibilityState === 'closed') {
      return;
    }
    this.progressBar.closeIfOpen();
    this.visibilityState = 'closed';
  }
}

type ProgressBarVisibilityState = 'closed' | 'showingIndeterminate' | 'showingPercentile';

function getUpdatePercent(progress: ProgressInfo) {
  let { percent } = progress;
  if (percent) {
    percent = Math.round(percent * 100) / 100;
  }
  return percent;
}

function createInitialProgressBarWindowOptions(
  type: 'indeterminate' | 'percentile',
  appName: string,
): InitialProgressBarWindowOptions {
  return {
    type,
    title: `${appName} Update`,
    initialText: `Downloading ${appName} update...`,
    textOnCompleted: 'Download completed.',
  };
}
