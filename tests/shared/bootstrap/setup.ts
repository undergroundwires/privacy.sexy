import { afterEach } from 'vitest';
import { enableAutoUnmount } from '@vue/test-utils';
import { polyfillBlob } from './BlobPolyfill';

enableAutoUnmount(afterEach);
polyfillBlob();
