/* YAML data files are loaded at compile time using vite-plugin-yaml` */
import WindowsData from '@/application/collections/windows.yaml';
import MacOsData from '@/application/collections/macos.yaml';
import LinuxData from '@/application/collections/linux.yaml';
import type { CollectionData } from '@/application/collections/';
import type { CollectionDataProvider } from './CollectionDataProvider';

export const loadPreloadedCollection: CollectionDataProvider = (collectionName: string) => {
  assertSupported(collectionName);
  const data = PreloadedData[collectionName];
  return data;
};

const PreloadedCollectionNames = [
  'windows',
  'macos',
  'linux',
] as const;

type PreloadedCollectionNameTuple = typeof PreloadedCollectionNames;
type PreloadedCollectionName = PreloadedCollectionNameTuple[number];

/**
 * Static collection data preloaded at build time.
 * This approach improves performance by avoiding runtime file loading.
 * The data is compiled into the application bundle as a static asset.
 */
const PreloadedData: Record<PreloadedCollectionName, CollectionData> = {
  windows: WindowsData,
  macos: MacOsData,
  linux: LinuxData,
};

function assertSupported(name: string): asserts name is PreloadedCollectionName {
  if (!PreloadedCollectionNames.some((supportedName) => supportedName === name)) {
    throw new Error(`Unknown collection name "${name}"`);
  }
}
