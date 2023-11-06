import { describe, it, expect } from 'vitest';
import { BrowserClipboard, NavigatorClipboard } from '@/presentation/components/Shared/Hooks/Clipboard/BrowserClipboard';
import { StubWithObservableMethodCalls } from '@tests/unit/shared/Stubs/StubWithObservableMethodCalls';
import { expectThrowsAsync } from '@tests/unit/shared/Assertions/ExpectThrowsAsync';

describe('BrowserClipboard', () => {
  describe('writeText', () => {
    it('calls navigator clipboard with the correct text', async () => {
      // arrange
      const expectedText = 'test text';
      const navigatorClipboard = new NavigatorClipboardStub();
      const clipboard = new BrowserClipboard(navigatorClipboard);
      // act
      await clipboard.copyText(expectedText);
      // assert
      const calls = navigatorClipboard.callHistory;
      expect(calls).to.have.lengthOf(1);
      const call = calls.find((c) => c.methodName === 'writeText');
      expect(call).toBeDefined();
      const [actualText] = call.args;
      expect(actualText).to.equal(expectedText);
    });
    it('throws when navigator clipboard fails', async () => {
      // arrange
      const expectedError = 'internalError';
      const navigatorClipboard = new NavigatorClipboardStub();
      navigatorClipboard.writeText = () => {
        throw new Error(expectedError);
      };
      const clipboard = new BrowserClipboard(navigatorClipboard);
      // act
      const act = () => clipboard.copyText('unimportant-text');
      // assert
      await expectThrowsAsync(act, expectedError);
    });
  });
});

class NavigatorClipboardStub
  extends StubWithObservableMethodCalls<NavigatorClipboard>
  implements NavigatorClipboard {
  writeText(data: string): Promise<void> {
    this.registerMethodCall({
      methodName: 'writeText',
      args: [data],
    });
    return Promise.resolve();
  }

  read(): Promise<ClipboardItems> {
    throw new Error('Method not implemented.');
  }

  readText(): Promise<string> {
    throw new Error('Method not implemented.');
  }

  write(): Promise<void> {
    throw new Error('Method not implemented.');
  }

  addEventListener(): void {
    throw new Error('Method not implemented.');
  }

  dispatchEvent(): boolean {
    throw new Error('Method not implemented.');
  }

  removeEventListener(): void {
    throw new Error('Method not implemented.');
  }
}
