import { defineConfig, mergeConfig } from 'vitest/config';
import { createVueConfig } from './vite.config';
import { getSelfDirectoryAbsolutePath } from './vite-config-helper';

const REPOSITORY_ROOT = getSelfDirectoryAbsolutePath();

export default mergeConfig(
  createVueConfig({ supportLegacyBrowsers: false }),
  defineConfig({
    root: REPOSITORY_ROOT,
    test: {
      maxWorkers: 2,
      include: [
        'tests/unit/**/*.spec.ts',
        'tests/integration/application/**/*.spec.ts',
        'tests/integration/presentation/components/Shared/Hooks/UseAutoUnsubscribedEventListener.spec.ts',
        'tests/integration/presentation/bootstrapping/Modules/MobileSafariActivePseudoClassEnabler.spec.ts',
      ],
      setupFiles: [
        `${REPOSITORY_ROOT}/tests/shared/bootstrap/SafeApplicationBoundaries.ts`,
      ],
      coverage: {
        provider: 'v8',
        reportsDirectory: 'dist-coverage',
        reporter: ['text-summary', 'html', 'json-summary', 'lcov'],
        include: [
          'src/**/*.ts',
          'src/**/*.vue',
        ],
        exclude: ['**/*.d.ts'],
      },
    },
  }),
);
