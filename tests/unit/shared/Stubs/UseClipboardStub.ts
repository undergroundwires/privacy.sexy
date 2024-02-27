import { useClipboard } from '@/presentation/components/Shared/Hooks/Clipboard/UseClipboard';
import type { Clipboard } from '@/presentation/components/Shared/Hooks/Clipboard/Clipboard';
import { StubWithObservableMethodCalls } from './StubWithObservableMethodCalls';
import { ClipboardStub } from './ClipboardStub';

export class UseClipboardStub
  extends StubWithObservableMethodCalls<ReturnType<typeof useClipboard>> {
  constructor(private readonly clipboard: Clipboard = new ClipboardStub()) {
    super();
  }

  public get(): ReturnType<typeof useClipboard> {
    const { clipboard } = this;
    clipboard.copyText = clipboard.copyText.bind(clipboard);
    return this.clipboard;
  }
}
