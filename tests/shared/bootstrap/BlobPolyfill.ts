import { Blob as BlobPolyfill } from 'node:buffer';

export function polyfillBlob() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  global.Blob = BlobPolyfill as any;
  // Workaround as `blob.text()` is not available in jsdom (https://github.com/jsdom/jsdom/issues/2555)
}
