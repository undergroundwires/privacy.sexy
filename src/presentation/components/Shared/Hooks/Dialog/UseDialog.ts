import { Dialog } from '@/presentation/common/Dialog';
import { CurrentEnvironment } from '@/infrastructure/RuntimeEnvironment/RuntimeEnvironmentFactory';
import { determineDialogBasedOnEnvironment } from './ClientDialogFactory';

export function useDialog(
  factory: DialogFactory = () => determineDialogBasedOnEnvironment(CurrentEnvironment),
) {
  const dialog = factory();
  return {
    dialog,
  };
}

export type DialogFactory = () => Dialog;
