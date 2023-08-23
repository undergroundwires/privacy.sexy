/// <reference types="vite/client" />

import { VITE_ENVIRONMENT_KEYS } from './ViteEnvironmentKeys';

export type ViteEnvironmentVariables = {
  readonly [K in keyof typeof VITE_ENVIRONMENT_KEYS]: string;
};

interface ImportMeta {
  readonly env: ViteEnvironmentVariables
}
