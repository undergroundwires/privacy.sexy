import type { FunctionKeys } from '@/TypeHelpers';
import { BrowserClipboard } from './BrowserClipboard';
import type { Clipboard } from './Clipboard';

export function useClipboard(clipboard: Clipboard = new BrowserClipboard()) {
  // Bind functions for direct use from destructured assignments such as `const { .. } = ...`.
  const functionKeys: readonly FunctionKeys<Clipboard>[] = ['copyText'];
  functionKeys.forEach((functionName) => {
    const fn = clipboard[functionName];
    clipboard[functionName] = fn.bind(clipboard);
  });
  return clipboard;
}
