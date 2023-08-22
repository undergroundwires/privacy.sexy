/// <reference types="vitest" />
import { defineConfig } from 'vite';
import Vue2 from '@vitejs/plugin-vue2';
import ViteYaml from '@modyfi/vite-plugin-yaml';
import { getAliasesFromTsConfig } from './vite-config-helper';

export default defineConfig({
  plugins: [
    Vue2(),
    ViteYaml(),
  ],
  test: {
    globals: true,
    alias: {
      ...getAliasesFromTsConfig(),
    },
    setupFiles: [
      'tests/bootstrap/setup.ts',
    ]
  }
});
