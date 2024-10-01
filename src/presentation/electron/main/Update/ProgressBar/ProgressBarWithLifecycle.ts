import type { IEventSource } from '@/infrastructure/Events/IEventSource';

/*
  Defines interfaces to abstract the progress bar implementation,
  serving as an anti-corruption layer. This approach allows for
  flexibility in switching implementations if needed in the future,
  while maintaining a consistent API for the rest of the application.
*/
export interface ProgressBarWithLifecycle {
  resetAndOpen(options: InitialProgressBarWindowOptions): void;
  closeIfOpen(): void;
  update(handler: ProgressBarUpdateCallback): void;
  readonly statusChanged: IEventSource<ProgressBarStatus>;
}

export type ProgressBarStatus = 'closed' | 'loading' | 'ready';

export type ProgressBarUpdateCallback = (bar: ProgressBarUpdater) => void;

export interface InitialProgressBarWindowOptions {
  readonly type: 'indeterminate' | 'percentile';
  readonly title: string,
  readonly initialText: string;
  readonly textOnCompleted: string;
}

export interface ProgressBarUpdater {
  setText(text: string): void;
  setClosable(closable: boolean): void;
  setProgress(progress: number): void;
}
