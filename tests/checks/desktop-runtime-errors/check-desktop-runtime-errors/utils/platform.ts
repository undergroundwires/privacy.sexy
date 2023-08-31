import { platform } from 'os';
import { die } from './log';

export enum SupportedPlatform {
  macOS,
  Windows,
  Linux,
}

const NODE_PLATFORM_MAPPINGS: {
  readonly [K in SupportedPlatform]: NodeJS.Platform;
} = {
  [SupportedPlatform.macOS]: 'darwin',
  [SupportedPlatform.Linux]: 'linux',
  [SupportedPlatform.Windows]: 'win32',
};

function findCurrentPlatform(): SupportedPlatform | undefined {
  const nodePlatform = platform();

  for (const key of Object.keys(NODE_PLATFORM_MAPPINGS)) {
    const keyAsSupportedPlatform = parseInt(key, 10) as SupportedPlatform;
    if (NODE_PLATFORM_MAPPINGS[keyAsSupportedPlatform] === nodePlatform) {
      return keyAsSupportedPlatform;
    }
  }

  return die(`Unsupported platform: ${nodePlatform}`);
}

export const CURRENT_PLATFORM: SupportedPlatform = findCurrentPlatform();
