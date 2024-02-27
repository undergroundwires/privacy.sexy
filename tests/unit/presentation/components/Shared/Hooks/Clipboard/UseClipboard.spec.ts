import { describe, it, expect } from 'vitest';
import { useClipboard } from '@/presentation/components/Shared/Hooks/Clipboard/UseClipboard';
import { BrowserClipboard } from '@/presentation/components/Shared/Hooks/Clipboard/BrowserClipboard';
import { ClipboardStub } from '@tests/unit/shared/Stubs/ClipboardStub';
import type { FunctionKeys } from '@/TypeHelpers';
import { expectExists } from '@tests/shared/Assertions/ExpectExists';

describe('useClipboard', () => {
  it(`returns an instance of ${BrowserClipboard.name}`, () => {
    // arrange
    const expectedType = BrowserClipboard;
    // act
    const clipboard = useClipboard();
    // assert
    expect(clipboard).to.be.instanceOf(expectedType);
  });
  it('does not create a new instance if one is provided', () => {
    // arrange
    const expectedClipboard = new ClipboardStub();
    // act
    const actualClipboard = useClipboard(expectedClipboard);
    // assert
    expect(actualClipboard).to.equal(expectedClipboard);
  });
  describe('supports object destructuring', () => {
    type ClipboardFunction = FunctionKeys<ReturnType<typeof useClipboard>>;
    const testScenarios: {
      readonly [FunctionName in ClipboardFunction]:
      Parameters<ReturnType<typeof useClipboard>[FunctionName]>;
    } = {
      copyText: ['text-arg'],
    };
    Object.entries(testScenarios).forEach(([functionName, testFunctionArgs]) => {
      describe(functionName, () => {
        it('binds the method to the instance', () => {
          // arrange
          const expectedArgs = testFunctionArgs;
          const clipboardStub = new ClipboardStub();
          // act
          const clipboard = useClipboard(clipboardStub);
          const { [functionName as ClipboardFunction]: testFunction } = clipboard;
          // assert
          testFunction(...expectedArgs);
          const call = clipboardStub.callHistory.find((c) => c.methodName === functionName);
          expectExists(call);
          expect(call.args).to.deep.equal(expectedArgs);
        });
        it('ensures method retains the clipboard instance context', () => {
          // arrange
          const clipboardStub = new ClipboardStub();
          const expectedThisContext = clipboardStub;
          let actualThisContext: typeof expectedThisContext | undefined;
          // eslint-disable-next-line func-names
          clipboardStub[functionName] = function () {
            // eslint-disable-next-line @typescript-eslint/no-this-alias
            actualThisContext = this;
          };
          // act
          const clipboard = useClipboard(clipboardStub);
          const { [functionName as ClipboardFunction]: testFunction } = clipboard;
          // assert
          testFunction(...testFunctionArgs);
          expect(expectedThisContext).to.equal(actualThisContext);
        });
      });
    });
  });
});
