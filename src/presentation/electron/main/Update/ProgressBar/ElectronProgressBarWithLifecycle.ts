// @ts-expect-error Outdated `@types/electron-progressbar` causes build failure on macOS
import ProgressBar from 'electron-progressbar';
import { BrowserWindow } from 'electron/main';
import { ElectronLogger } from '@/infrastructure/Log/ElectronLogger';
import type { Logger } from '@/application/Common/Log/Logger';
import { EventSource } from '@/infrastructure/Events/EventSource';
import type {
  InitialProgressBarWindowOptions,
  ProgressBarUpdater,
  ProgressBarStatus,
  ProgressBarUpdateCallback, ProgressBarWithLifecycle,
} from './ProgressBarWithLifecycle';

/**
 * It provides a type-safe way to manage `electron-progressbar` instance,
 * through its lifecycle, ensuring correct usage, state transitions, and cleanup.
 */
export class ElectronProgressBarWithLifecycle implements ProgressBarWithLifecycle {
  private state: ProgressBarWithState = { status: 'closed' };

  public readonly statusChanged = new EventSource<ProgressBarStatus>();

  private readyCallbacks = new Array<ProgressBarUpdateCallback>();

  constructor(
    private readonly logger: Logger = ElectronLogger,
  ) { }

  public update(handler: ProgressBarUpdateCallback): void {
    switch (this.state.status) { // eslint-disable-line default-case
      case 'closed':
        // Throwing an error here helps catch bugs early in the development process.
        throw new Error('Cannot update the progress bar because it is not currently open.');
      case 'ready':
        handler(wrapForUpdate(this.state));
        break;
      case 'loading':
        this.readyCallbacks.push(handler);
        break;
    }
  }

  public resetAndOpen(options: InitialProgressBarWindowOptions): void {
    this.closeIfOpen();
    const bar = createElectronProgressBar(options);
    this.state = { status: 'loading', progressBar: bar };
    bar.on('ready', () => this.handleReadyEvent(bar));
    bar.on('aborted' /* closed by user */, (value: number) => {
      this.changeState({ status: 'closed' });
      this.logger.info(`Progress bar window closed by user. State: ${this.state.status}, Value: ${value}.`);
    });
  }

  public closeIfOpen() {
    if (this.state.status === 'closed') {
      return;
    }
    this.state.progressBar.close();
    this.changeState({
      status: 'closed',
    });
  }

  private handleReadyEvent(bar: ProgressBar): void {
    if (this.state.status !== 'loading' || this.state.progressBar !== bar) {
      // Handle race conditions if `open` called rapidly without closing to avoid leaks
      this.logger.warn('Unexpected state when handling ready event. Closing the progress bar.');
      bar.close();
      return;
    }
    const readyBar: ReadyProgressBar = {
      status: 'ready',
      progressBar: bar,
      browserWindow: getWindow(bar),
    };
    this.readyCallbacks.forEach((callback) => callback(wrapForUpdate(readyBar)));
    this.changeState(readyBar);
  }

  private changeState(newState: ProgressBarWithState): void {
    if (isSameState(this.state, newState)) {
      return;
    }
    this.readyCallbacks = [];
    this.state = newState;
    this.statusChanged.notify(newState.status);
  }
}

type ProgressBarWithState = { readonly status: 'closed' }
| { readonly status: 'loading', readonly progressBar: ProgressBar }
| ReadyProgressBar;

interface ReadyProgressBar {
  readonly status: 'ready';
  readonly progressBar: ProgressBar;
  readonly browserWindow: BrowserWindow;
}

function getWindow(bar: ProgressBar): BrowserWindow {
  // Note: The ProgressBar library does not provide a public method or event
  // to access the BrowserWindow, so we access the internal `_window` property directly.
  if (!('_window' in bar)) {
    throw new Error('Unable to access the progress bar window.');
  }
  const browserWindow = bar._window as BrowserWindow; // eslint-disable-line no-underscore-dangle
  if (!browserWindow) {
    throw new Error('Missing internal browser window');
  }
  return browserWindow;
}

function isSameState( // eslint-disable-line consistent-return
  first: ProgressBarWithState,
  second: ProgressBarWithState,
): boolean {
  switch (first.status) { // eslint-disable-line default-case
    case 'closed':
      return second.status === 'closed';
    case 'loading':
      return second.status === 'loading'
        && second.progressBar === first.progressBar;
    case 'ready':
      return second.status === 'ready'
        && second.progressBar === first.progressBar
        && second.browserWindow === first.browserWindow;
  }
}

function wrapForUpdate(bar: ReadyProgressBar): ProgressBarUpdater {
  return {
    setText: (text: string) => {
      bar.progressBar.detail = text;
    },
    setClosable: (closable: boolean) => {
      bar.browserWindow.setClosable(closable);
    },
    setProgress: (progress: number) => {
      bar.progressBar.value = progress;
    },
  };
}

function createElectronProgressBar(
  options: InitialProgressBarWindowOptions,
): ProgressBar {
  const bar = new ProgressBar({
    indeterminate: options.type === 'indeterminate',
    title: options.title,
    text: options.initialText,
  });
  if (options.type === 'percentile') { // Indeterminate progress bar does not fire `completed` event, see `electron-progressbar` docs
    bar.on('completed', () => {
      bar.detail = options.textOnCompleted;
    });
  }
  return bar;
}
