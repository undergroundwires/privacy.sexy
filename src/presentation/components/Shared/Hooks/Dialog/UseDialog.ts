import { Dialog } from '@/presentation/common/Dialog';
import { CurrentEnvironment } from '@/infrastructure/RuntimeEnvironment/RuntimeEnvironmentFactory';
import { createEnvironmentSpecificLoggedDialog } from './ClientDialogFactory';

export function useDialog(
  factory: DialogFactory = () => createEnvironmentSpecificLoggedDialog(CurrentEnvironment),
) {
  const dialog = factory();
  return {
    dialog,
  };
}

export type DialogFactory = () => Dialog;
