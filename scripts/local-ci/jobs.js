/*
  Catalog of local CI jobs: the ubuntu-latest legs of `.github/workflows`, one per matrix entry.
  Jobs run in catalog order in one container at `/work`; `host` jobs need Docker itself.
  `extended` jobs are slow, network-heavy, or download large tools.
  They run only with `--all` or `--only`.
*/

const lint = (script) => ({
  id: script.replaceAll(':', '-'),
  workflow: 'checks.quality',
  steps: [`npm run ${script}`],
});

const buildWeb = (mode) => ({
  id: `build-web-${mode}`,
  workflow: 'checks.build',
  steps: [
    `npm run build -- --mode ${mode}`,
    'npm run check:verify-build-artifacts -- --web',
  ],
});

const buildDesktop = (mode) => ({
  id: `build-desktop-${mode}`,
  workflow: 'checks.build',
  steps: [
    `npm run electron:prebuild -- --mode ${mode}`,
    'npm run check:verify-build-artifacts -- --electron-unbundled',
    'npm run electron:build -- --publish never',
    'npm run check:verify-build-artifacts -- --electron-bundled',
  ],
});

const INSTALL_DEPS_ARGUMENTS = ['', '--no-errors', '--ci', '--fresh --non-deterministic', '--fresh', '--non-deterministic'];
const RESTORE_LOCKFILE = 'git checkout -- package-lock.json';

const CODEQL_DIR = '"$HOME/.cache/codeql"';
const CODEQL = `${CODEQL_DIR}/codeql/codeql`;

export const ROOT_PREPARE_STEPS = [
  'mkdir -p /run/dbus && dbus-daemon --system --fork', // Electron expects a system bus like on runners
];

export const PREPARE_STEPS = [
  'tar -xf /tmp/source.tar -C /work',
  'git init -q && git add -A && git -c user.name=local-ci -c user.email=local-ci@localhost commit -q -m "local-ci snapshot"',
  'git remote add origin "$ORIGIN_URL"', // remark-validate-links resolves repository links through it
  'npm ci --engine-strict --strict-peer-deps',
  // Electron downloads lazily on first import; parallel vitest workers would race to extract it.
  'node node_modules/electron/install.js',
];

export const JOBS = [
  lint('lint:eslint'),
  lint('lint:yaml'),
  lint('lint:md'),
  lint('lint:md:consistency'),
  lint('lint:md:relative-urls'),
  lint('lint:md:external-urls'),
  {
    id: 'todo-check',
    workflow: 'checks.quality',
    steps: ["if git grep 'TODO'':' HEAD; then echo 'TODO comments found in the latest commit.'; exit 1; fi"],
  },
  { id: 'pylint', workflow: 'checks.quality', steps: ['npm run lint:pylint'] },
  {
    id: 'validate-collections',
    workflow: 'checks.quality',
    steps: ['uv run --project ./scripts/validate-collections-yaml --locked python ./scripts/validate-collections-yaml'],
  },
  { id: 'unit', workflow: 'unit-tests', steps: ['npm run test:unit'] },
  { id: 'integration', workflow: 'integration-tests', steps: ['npm run test:integration'] },
  {
    id: 'safe',
    workflow: 'non-executing-tests',
    env: { NODE_DISABLE_COMPILE_CACHE: '1' },
    steps: ['node node_modules/vue-tsc/bin/vue-tsc.js --noEmit', 'make coverage'],
    artifacts: ['dist-coverage'],
  },
  buildWeb('development'),
  buildWeb('production'),
  buildWeb('test'),
  buildDesktop('development'),
  buildDesktop('production'),
  { id: 'build-docker', workflow: 'checks.build', host: true },
  { id: 'icons-build', workflow: 'checks.scripts', steps: ['npm run icons:build'] },
  {
    id: 'e2e',
    workflow: 'e2e-tests',
    // Docker gives Node ::1 first for localhost while getaddrinfo clients get 127.0.0.1,
    // so vite preview bound to localhost is unreachable for wait-on without IPv4-first.
    env: { NODE_OPTIONS: '--dns-result-order=ipv4first' },
    steps: ['npm run test:cy:run'],
    artifacts: ['tests/e2e/videos', 'tests/e2e/screenshots'],
  },
  {
    id: 'npm-audit',
    workflow: 'checks.security.dependencies',
    steps: ['npm audit --package-lock-only --ignore-scripts'],
  },
  {
    id: 'desktop-runtime',
    workflow: 'checks.desktop-runtime-errors',
    extended: true,
    env: { SCREENSHOT: 'true', BUILD: 'true', APPIMAGE_EXTRACT_AND_RUN: '1' },
    steps: ["xvfb-run --auto-servernum --server-args='-screen 0 1024x768x24' dbus-run-session -- npm run check:desktop"],
    artifacts: ['screenshot.png'],
  },
  {
    id: 'external-urls',
    workflow: 'checks.external-urls',
    extended: true,
    env: { RANDOMIZED_URL_CHECK_LIMIT: '100' },
    steps: ['npm run check:external-urls'],
  },
  {
    id: 'codeql',
    workflow: 'checks.security.sast',
    extended: true,
    steps: [
      `test -x ${CODEQL} || (mkdir -p ${CODEQL_DIR} && curl -fsSL https://github.com/github/codeql-action/releases/latest/download/codeql-bundle-linux64.tar.gz | tar -xz -C ${CODEQL_DIR})`,
      `${CODEQL} database create /tmp/codeql-db --overwrite --language=javascript-typescript --build-mode=none --source-root=/work`,
      `${CODEQL} database analyze /tmp/codeql-db codeql/javascript-queries:codeql-suites/javascript-security-and-quality.qls --format=sarif-latest --output=/work/codeql.sarif --threads=0`,
      'jq -r \'.runs[].results[] | "\\(.level // "warning")\\t\\(.ruleId)\\t\\(.locations[0].physicalLocation.artifactLocation.uri):\\(.locations[0].physicalLocation.region.startLine)"\' codeql.sarif',
    ],
    artifacts: ['codeql.sarif'],
  },
  {
    id: 'install-deps',
    workflow: 'checks.scripts',
    extended: true, // Runs last: it rewrites node_modules, then restores the locked install.
    steps: [
      ...INSTALL_DEPS_ARGUMENTS.flatMap((args) => {
        const command = `npm run install-deps${args ? ` -- ${args}` : ''}`;
        return [
          `${RESTORE_LOCKFILE} && ${command}`,
          `${RESTORE_LOCKFILE} && rm -rf node_modules && ${command}`,
        ];
      }),
      `${RESTORE_LOCKFILE} && npm ci --engine-strict --strict-peer-deps`,
    ],
  },
];
