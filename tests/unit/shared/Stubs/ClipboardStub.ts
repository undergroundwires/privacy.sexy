import { Clipboard } from '@/presentation/components/Shared/Hooks/Clipboard/Clipboard';
import { StubWithObservableMethodCalls } from './StubWithObservableMethodCalls';

export class ClipboardStub
  extends StubWithObservableMethodCalls<Clipboard>
  implements Clipboard {
  public copyText(text: string): Promise<void> {
    this.registerMethodCall({
      methodName: 'copyText',
      args: [text],
    });
    return Promise.resolve();
  }
}
