import { platform } from 'os';

export const SUPPORTED_PLATFORMS = {
  MAC: 'darwin',
  LINUX: 'linux',
  WINDOWS: 'win32',
};

export const CURRENT_PLATFORM = platform();
