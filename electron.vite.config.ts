import { resolve } from 'node:path';
import { mergeConfig, type UserConfig } from 'vite';
import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import { getAliases, getClientEnvironmentVariables } from './vite-config-helper';
import { createVueConfig } from './vite.config';
import distDirs from './dist-dirs.json' assert { type: 'json' };

const MAIN_ENTRY_FILE = resolvePathFromProjectRoot('src/presentation/electron/main/index.ts');
const PRELOAD_ENTRY_FILE = resolvePathFromProjectRoot('src/presentation/electron/preload/index.ts');
const WEB_INDEX_HTML_PATH = resolvePathFromProjectRoot('src/presentation/index.html');
const ELECTRON_DIST_SUBDIRECTORIES = {
  main: resolveElectronDistSubdirectory('main'),
  preload: resolveElectronDistSubdirectory('preload'),
  renderer: resolveElectronDistSubdirectory('renderer'),
};

process.env.ELECTRON_ENTRY = resolve(ELECTRON_DIST_SUBDIRECTORIES.main, 'index.mjs');

export default defineConfig({
  main: getSharedElectronConfig({
    distDirSubfolder: ELECTRON_DIST_SUBDIRECTORIES.main,
    entryFilePath: MAIN_ENTRY_FILE,
  }),
  preload: getSharedElectronConfig({
    distDirSubfolder: ELECTRON_DIST_SUBDIRECTORIES.preload,
    entryFilePath: PRELOAD_ENTRY_FILE,
  }),
  renderer: mergeConfig(
    createVueConfig({
      supportLegacyBrowsers: false,
    }),
    {
      build: {
        outDir: ELECTRON_DIST_SUBDIRECTORIES.renderer,
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
      outDir: options.distDirSubfolder,
      lib: {
        entry: options.entryFilePath,
      },
      rollupOptions: {
        output: {
          format: 'es',

          // Ensure all generated files use '.mjs' for module consistency.
          // Otherwise, preloader process get `.mjs` extension but main process get `.js` extension, see https://github.com/alex8088/electron-vite/issues/397.
          entryFileNames: '[name].mjs',
        },
      },
    },
    plugins: [externalizeDepsPlugin({
      exclude: [
        // Keep 'electron-log' in bundling process.
        // This is a workaround for inability of Electron's ESM loader to resolve subpath imports.
        // Do not externalize `electron-log` so subpath imports such as `electron-log/main` works.
        // See https://github.com/electron/electron/issues/41241, https://github.com/alex8088/electron-vite/issues/401
        'electron-log',
      ],
    })],
    define: {
      ...getClientEnvironmentVariables(),
    },
    resolve: {
      alias: {
        ...getAliases(),
      },
    },
  };
}

function resolvePathFromProjectRoot(pathSegment: string): string {
  return resolve(__dirname, pathSegment);
}

function resolveElectronDistSubdirectory(subDirectory: string): string {
  const electronDistDir = resolvePathFromProjectRoot(distDirs.electronUnbundled);
  return resolve(electronDistDir, subDirectory);
}
