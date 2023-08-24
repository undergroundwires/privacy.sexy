/// <reference types="vitest" />
import { resolve } from 'path';
import { defineConfig } from 'vite';
import legacy from '@vitejs/plugin-legacy';
import vue from '@vitejs/plugin-vue2';
import ViteYaml from '@modyfi/vite-plugin-yaml';
import { getAliasesFromTsConfig, getClientEnvironmentVariables, getSelfDirectoryAbsolutePath } from './vite-config-helper';

const WEB_DIRECTORY = resolve(getSelfDirectoryAbsolutePath(), 'src/presentation');
const TEST_INITIALIZATION_FILE = resolve(getSelfDirectoryAbsolutePath(), 'tests/shared/bootstrap/setup.ts');
const NODE_CORE_MODULES = ['os', 'child_process', 'fs', 'path'];

export default defineConfig({
  root: WEB_DIRECTORY,
  plugins: [
    vue(),
    ViteYaml(),
    legacy(),
  ],
  esbuild: {
    supported: {
      'top-level-await': true, // Exclude browsers not supporting top-level-await
    },
  },
  define: {
    ...getClientEnvironmentVariables(),
  },
  resolve: {
    alias: {
      ...getAliasesFromTsConfig(),
    },
  },
  build: {
    rollupOptions: {
      // Ensure Node core modules are externalized and don't trigger warnings in browser builds
      external: {
        ...NODE_CORE_MODULES,
      },
    },
  },
  server: {
    port: 3169,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    alias: {
      ...getAliasesFromTsConfig(),
    },
    setupFiles: [
      TEST_INITIALIZATION_FILE,
    ],
  },
});
