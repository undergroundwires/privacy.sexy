# Development

Before your commit, a good practice is to:

1. Run `npm run check:quality`.
2. Choose additional [tests](#testing) or [lint checks](#linting) that fit the change.

You could run other types of tests as well, but they may take longer time and overkill for your changes.
Automated actions are set up to execute these tests as necessary.
See [ci-cd.md](./ci-cd.md) for more information.

`npm run check:quality` runs type checking, ESLint, the safe test suite, and the web build. It does not run the full `npm run lint` command, Python validation, or external URL checks. Run it explicitly before committing if it suits your change. No Git hook is installed or enabled by this project.

`npm` is the canonical command interface, including on Windows. Optional Make targets mirror common tasks for contributors who already use Make. Installing Make is not required.

Run `make help` to list targets: `test-fast` (unit-only safe tests), `test` (the complete safe suite),
`lint` (ESLint only), `coverage`, `build`, and `check` (the combined quality command).
Override `NPM` when npm is not on your PATH. No target installs dependencies or changes Git hooks.

## Commands

### Prerequisites

- Install Node.js:
  - Use Node.js 22.22.2 or later on the 22.x line, 24.15.0 or later on the 24.x line, or 26+. See `engines` in `package.json`.
  - CI selects the latest Node.js 24 release through [action.yml](./../.github/actions/setup-node/action.yml). Installation enforces the minimum versions declared in `package.json`.
  - 💡 Recommended: Use [`nvm`](https://github.com/nvm-sh/nvm) CLI to install and switch between Node.js versions.
- Install dependencies using `npm install` (or [`npm run install-deps`](#utility-scripts) for more options).
- For Visual Studio Code users, running the configuration script is recommended to optimize the IDE settings, as detailed in [utility scripts](#utility-scripts).

### Testing

- On personal computers, use the [non-executing validation profile](#non-executing-validation-on-personal-computers).
- Run unit tests: `npm run test:unit`
- Run the safe suite with V8 coverage reports: `npm run test:coverage`. Reports are written to `dist-coverage`.
- Run integration tests: `npm run test:integration`
- Run end-to-end (e2e) tests:
  - `npm run test:cy:open`: Run tests interactively using the development server with hot-reloading.
  - `npm run test:cy:run`: Run tests on the production build in a headless mode.
- Run checks:
  - `npm run check:desktop`: Run runtime checks for packaged desktop applications ([README.md](./../tests/checks/desktop-runtime-errors/check-desktop-runtime-errors/README.md)).
    - You can set environment variables active its flags such as `BUILD=true SCREENSHOT=true npm run check:desktop`
  - `npm run check:external-urls`: Test whether external URLs used in applications are alive.

📖 Read more about testing in [tests](./tests.md).

### Non-executing validation on personal computers

Do not apply privacy scripts to your development machine to test this project.
The normal integration suite executes generated shell files, and desktop checks launch the application.
Use disposable machines for those checks.

Install repository-local dependencies without lifecycle scripts:

```sh
npm ci --include=dev --ignore-scripts --engine-strict --strict-peer-deps --cache ./dist-maintenance/npm-cache
```

This skips Electron/Cypress binary installation and the project's `postinstall` hook.
Do not import the real Electron package afterward: current Electron versions can download binaries at import time.
Do not run `install-deps`, `electron:dev`, `electron:preview`, `electron:build`, `check:desktop`, or the full integration suite here.

The following commands type-check, test in memory, and produce repository-local web artifacts:

```sh
node node_modules/vue-tsc/bin/vue-tsc.js --noEmit
node node_modules/vitest/vitest.mjs run --config vitest.safe.config.ts --maxWorkers=2
node node_modules/vite/bin/vite.js build
node scripts/verify-build-artifacts.js --web
```

`npm run test:safe` is the equivalent test entrypoint.
The safe profile includes unit tests, application-layer integration tests (including collection compilation),
and the explicitly allowlisted DOM listener lifecycle integration test.
It substitutes throwing boundaries for Electron, its updater/logging/progress UI, and application child-process calls.
It never applies the generated Windows, macOS, or Linux scripts.
These mocks are not an operating-system sandbox; review new tests and imports before adding them to this profile.
Filesystem adapters must continue to use the existing injected stubs in unit tests.

Set `NODE_DISABLE_COMPILE_CACHE=1` in the current command environment if Node's compile cache must not write outside the repository.
Do not change global npm configuration, install global tools, or change Windows settings for this workflow.
Passing these checks proves neither policy effectiveness nor desktop packaging, updater, or runtime compatibility.

See the [maintenance assessment](./maintenance-assessment.md) for verified changes and remaining release gates.

### Linting

- Lint all (recommended 💡): `npm run lint`
- Markdown: `npm run lint:md`
- Markdown consistency `npm run lint:md:consistency`
- Markdown relative URLs: `npm run lint:md:relative-urls`
- Markdown external URLs: `npm run lint:md:external-urls`
- JavaScript/TypeScript: `npm run lint:eslint`
- Yaml: `npm run lint:yaml`

### Running

**Web:**

- Run in local server: `npm run dev`
  - 💡 Meant for local development with features such as hot-reloading.
- Preview production build: `npm run preview`
  - Start a local web server that serves the built solution from `./dist-web`.
  - 💡 Run `npm run build` before `npm run preview`.

**Desktop apps:**

- `npm run electron:dev`: The command will build the main process and preload scripts source code, and start a dev server for the renderer, and start the Electron app.
- `npm run electron:preview`: The command will build the main process, preload scripts and renderer source code, and start the Electron app to preview.
- `npm run electron:prebuild`: The command will build the main process, preload scripts and renderer source code. Usually before packaging the Electron application, you need to execute this command.
- `npm run electron:build -- --publish never`: Packages the prebuilt Electron application without publishing. Run `npm run electron:prebuild` first.

**Docker:**

1. Build: `docker build -t undergroundwires/privacy.sexy:latest .`
2. Run: `docker run -it -p 8080:80 --rm --name privacy.sexy undergroundwires/privacy.sexy:latest`
3. Application should be available at [`http://localhost:8080`](http://localhost:8080)

### Building

- Build web application: `npm run build`
- Build desktop application: `npm run electron:prebuild`, then `npm run electron:build -- --publish never`.
- (Re)create icons (see [documentation](../img/README.md)): `npm run icons:build`

### Scripts

📖 For detailed options and behavior for any of the following scripts, please refer to the script file itself.

#### Utility scripts

- [**`npm run install-deps [-- <options>]`**](../scripts/npm-install.js):
  - Manages NPM dependency installation, it offers capabilities like doing a fresh install, retries on network errors, and other features.
  - For example, you can run `npm run install-deps -- --fresh` to do clean installation of dependencies.
  - Use `--root-directory <path>` to select a project without changing the caller's working directory. `--help` lists options without installing anything; unknown or incomplete options fail before installation.
  - CI uses strict `npm ci` directly and does not update Browserslist or regenerate the lockfile. Refresh dependency metadata deliberately in a maintenance change and commit the resulting lockfile.
- [**`python ./scripts/configure_vscode.py`**](../scripts/configure_vscode.py):
  - Optimizes Visual Studio Code settings and installs essential extensions, enhancing the development environment.
- [**`uv run --project ./scripts/validate-collections-yaml --locked python ./scripts/validate-collections-yaml`**](../scripts/validate-collections-yaml/README.md):
  - Validates collection YAML against its schema in an isolated, locked Python environment. Run from the repository root.

#### Automation scripts

- [**`node scripts/print-dist-dir.js [<options>]`**](../scripts/print-dist-dir.js):
  - Determines the absolute path of a distribution directory based on CLI arguments and outputs its absolute path.
- [**`npm run check:verify-build-artifacts [-- <options>]`**](../scripts/verify-build-artifacts.js):
  - Verifies the existence and content of build artifacts. Useful for ensuring that the build process is generating the expected output.
- [**`node scripts/verify-web-server-status.js --url [URL]`**](../scripts/verify-web-server-status.js):
  - Checks if a specified server is up with retries and returns an HTTP 200 status code.

## Recommended extensions

You should use EditorConfig to follow project style.

For Visual Studio Code, [`.vscode/extensions.json`](./../.vscode/extensions.json) includes list of recommended extensions.
You can use [VSCode configuration script](#utility-scripts) to automatically install those.
