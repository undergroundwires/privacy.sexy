import { RuntimeEnvironment } from '@/infrastructure/RuntimeEnvironment/RuntimeEnvironment';
import { Dialog } from '@/presentation/common/Dialog';
import { BrowserDialog } from '@/infrastructure/Dialog/Browser/BrowserDialog';
import { decorateWithLogging } from '@/infrastructure/Dialog/LoggingDialogDecorator';
import { ClientLoggerFactory } from '../Log/ClientLoggerFactory';

export function createEnvironmentSpecificLoggedDialog(
  environment: RuntimeEnvironment,
  dialogLoggingDecorator: DialogLoggingDecorator = ClientLoggingDecorator,
  windowInjectedDialogFactory: WindowDialogCreationFunction = () => globalThis.window.dialog,
  browserDialogFactory: BrowserDialogCreationFunction = () => new BrowserDialog(),
): Dialog {
  const dialog = determineDialogBasedOnEnvironment(
    environment,
    windowInjectedDialogFactory,
    browserDialogFactory,
  );
  const loggingDialog = dialogLoggingDecorator(dialog);
  return loggingDialog;
}

function determineDialogBasedOnEnvironment(
  environment: RuntimeEnvironment,
  windowInjectedDialogFactory: WindowDialogCreationFunction = () => globalThis.window.dialog,
  browserDialogFactory: BrowserDialogCreationFunction = () => new BrowserDialog(),
): Dialog {
  if (!environment.isRunningAsDesktopApplication) {
    return browserDialogFactory();
  }
  const windowDialog = windowInjectedDialogFactory();
  if (!windowDialog) {
    throw new Error([
      'Failed to retrieve Dialog API from window object in desktop environment.',
      'This may indicate that the Dialog API is either not implemented or not correctly exposed in the current desktop environment.',
    ].join('\n'));
  }
  return windowDialog;
}

export type WindowDialogCreationFunction = () => Dialog | undefined;

export type BrowserDialogCreationFunction = () => Dialog;

export type DialogLoggingDecorator = (dialog: Dialog) => Dialog;

const ClientLoggingDecorator: DialogLoggingDecorator = (dialog) => decorateWithLogging(
  dialog,
  ClientLoggerFactory.Current.logger,
);
