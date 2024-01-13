import { RuntimeEnvironment } from '@/infrastructure/RuntimeEnvironment/RuntimeEnvironment';
import { Dialog } from '@/presentation/common/Dialog';
import { BrowserDialog } from '@/infrastructure/Dialog/Browser/BrowserDialog';

export function determineDialogBasedOnEnvironment(
  environment: RuntimeEnvironment,
  windowInjectedDialogFactory: WindowDialogCreationFunction = () => globalThis.window.dialog,
  browserDialogFactory: BrowserDialogCreationFunction = () => new BrowserDialog(),
): Dialog {
  if (!environment.isRunningAsDesktopApplication) {
    return browserDialogFactory();
  }
  const dialog = windowInjectedDialogFactory();
  if (!dialog) {
    throw new Error([
      'The Dialog API could not be retrieved from the window object.',
      'This may indicate that the Dialog API is either not implemented or not correctly exposed in the current desktop environment.',
    ].join('\n'));
  }
  return dialog;
}

export type WindowDialogCreationFunction = () => Dialog | undefined;

export type BrowserDialogCreationFunction = () => Dialog;
