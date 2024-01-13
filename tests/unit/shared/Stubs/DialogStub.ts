import { Dialog } from '@/presentation/common/Dialog';

export class DialogStub implements Dialog {
  public saveFile(): Promise<void> {
    return Promise.resolve();
  }
}
