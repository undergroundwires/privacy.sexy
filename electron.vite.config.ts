import { resolve } from 'path';
import { mergeConfig, UserConfig } from 'vite';
import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import { getAliasesFromTsConfig, getClientEnvironmentVariables } from './vite-config-helper';
import { createVueConfig } from './vite.config';
import distDirs from './dist-dirs.json' assert { type: 'json' };

const MAIN_ENTRY_FILE = resolvePathFromProjectRoot('src/presentation/electron/main/index.ts');
const PRELOAD_ENTRY_FILE = resolvePathFromProjectRoot('src/presentation/electron/preload/index.ts');
const WEB_INDEX_HTML_PATH = resolvePathFromProjectRoot('src/presentation/index.html');
const DIST_DIR = resolvePathFromProjectRoot(distDirs.electronUnbundled);

export default defineConfig({
  main: getSharedElectronConfig({
    distDirSubfolder: 'main',
    entryFilePath: MAIN_ENTRY_FILE,
  }),
  preload: getSharedElectronConfig({
    distDirSubfolder: 'preload',
    entryFilePath: PRELOAD_ENTRY_FILE,
  }),
  renderer: mergeConfig(
    createVueConfig({
      supportLegacyBrowsers: false,
    }),
    {
      build: {
        outDir: resolve(DIST_DIR, 'renderer'),
        rollupOptions: {
          input: {
            index: WEB_INDEX_HTML_PATH,
          },
        },
      },
    },
  ),
});

function getSharedElectronConfig(options: {
  readonly distDirSubfolder: string;
  readonly entryFilePath: string;
}): UserConfig {
  return {
    build: {
      outDir: resolve(DIST_DIR, options.distDirSubfolder),
      lib: {
        entry: options.entryFilePath,
      },
      rollupOptions: {
        output: {
          entryFileNames: '[name].cjs', // This is needed so `type="module"` works
        },
      },
    },
    plugins: [externalizeDepsPlugin()],
    define: {
      ...getClientEnvironmentVariables(),
    },
    resolve: {
      alias: {
        ...getAliasesFromTsConfig(),
      },
    },
  };
}

function resolvePathFromProjectRoot(pathSegment: string) {
  return resolve(__dirname, pathSegment);
}
