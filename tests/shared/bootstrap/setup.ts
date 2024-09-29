import { afterEach } from 'vitest';
import { enableAutoUnmount } from '@vue/test-utils';
import { polyfillBlob } from './BlobPolyfill';
import { failTestOnConsoleError } from './FailTestOnConsoleError';

enableAutoUnmount(afterEach);
polyfillBlob();
failTestOnConsoleError();
