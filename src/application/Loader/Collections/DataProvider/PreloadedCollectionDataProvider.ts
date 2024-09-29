/* YAML data files are loaded at compile time using vite-plugin-yaml` */
import WindowsData from '@/application/collections/windows.yaml';
import MacOsData from '@/application/collections/macos.yaml';
import LinuxData from '@/application/collections/linux.yaml';
import type { CollectionData } from '@/application/collections/';
import type { CollectionDataProvider } from './CollectionDataProvider';

/**
 * Static collection data preloaded at build time.
 * This approach improves performance by avoiding runtime file loading.
 * The data is compiled into the application bundle as a static asset.
 */
const PreloadedData: Map<string, CollectionData> = new Map([
  ['windows', WindowsData],
  ['macos', MacOsData],
  ['linux', LinuxData],
]);

export const loadPreloadedCollection: CollectionDataProvider = (name: string) => {
  const data = PreloadedData.get(name);
  if (!data) {
    throw new Error(`Unknown collection file name "${name}"`);
  }
  return data;
};
