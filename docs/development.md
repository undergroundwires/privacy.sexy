# Development

Before your commit, a good practice is to:

1. [Run unit tests](#testing)
2. [Lint your code](#linting)

You could run other types of tests as well, but they may take longer time and overkill for your changes.
Automated actions are set up to execute these tests as necessary.
See [ci-cd.md](./ci-cd.md) for more information.

## Commands

### Prerequisites

- Install Node >16.x.
- Install dependencies using `npm install` (or [`npm run install-deps`](#utility-scripts) for more options).

### Testing

- Run unit tests: `npm run test:unit`
- Run integration tests: `npm run test:integration`
- Run end-to-end (e2e) tests:
  - `npm run test:cy:open`: Run tests interactively using the development server with hot-reloading.
  - `npm run test:cy:run`: Run tests on the production build in a headless mode.
- Run checks:
  - `npm run check:desktop`: Run runtime checks for packaged desktop applications ([README.md](./../tests/checks/desktop-runtime-errors/check-desktop-runtime-errors/README.md)).
    - You can set environment variables active its flags such as `BUILD=true SCREENSHOT=true npm run check:desktop`
  - `npm run check:external-urls`: Test whether external URLs used in applications are alive.

📖 Read more about testing in [tests](./tests.md).

### Linting

- Lint all (recommended 💡): `npm run lint`
- Markdown: `npm run lint:md`
- Markdown consistency `npm run lint:md:consistency`
- Markdown relative URLs: `npm run lint:md:relative-urls`
- JavaScript/TypeScript: `npm run lint:eslint`
- Yaml: `npm run lint:yaml`

### Running

**Web:**

- Run in local server: `npm run dev`
  - 💡 Meant for local development with features such as hot-reloading.
- Preview production build: `npm run preview`
  - Start a local web server that serves the built solution from `./dist`.
  - 💡 Run `npm run build` before `npm run preview`.

**Desktop apps:**

- `npm run electron:dev`: The command will build the main process and preload scripts source code, and start a dev server for the renderer, and start the Electron app.
- `npm run electron:preview`: The command will build the main process, preload scripts and renderer source code, and start the Electron app to preview.
- `npm run electron:prebuild`: The command will build the main process, preload scripts and renderer source code. Usually before packaging the Electron application, you need to execute this command.
- `npm run electron:build`: Prebuilds the Electron application, packages and publishes it through `electron-builder`.

**Docker:**

1. Build: `docker build -t undergroundwires/privacy.sexy:latest .`
2. Run: `docker run -it -p 8080:80 --rm --name privacy.sexy undergroundwires/privacy.sexy:latest`

### Building

- Build web application: `npm run build`
- Build desktop application: `npm run electron:build`
- (Re)create icons (see [documentation](../img/README.md)): `npm run create-icons`

### Scripts

📖 For detailed options and behavior for any of the following scripts, please refer to the script file itself.

#### Utility scripts

- [**`npm run install-deps [-- <options>]`**](../scripts/npm-install.js):
  - Manages NPM dependency installation, it offers capabilities like doing a fresh install, retries on network errors, and other features.
  - For example, you can run `npm run install-deps -- --fresh` to do clean installation of dependencies.
- [**`./scripts/configure-vscode.sh`**](../scripts/configure-vscode.sh):
  - This script checks and sets the necessary configurations for VSCode in `settings.json` file.

#### Automation scripts

- [**`node scripts/print-dist-dir.js [-- <options>]`**](../scripts/print-dist-dir.js):
  - Determines the absolute path of a distribution directory based on CLI arguments and outputs its absolute path.
  - Primarily used by automation scripts.
- [**`npm run check:verify-build-artifacts [-- <options>]`**](../scripts/verify-build-artifacts.js):
  - Verifies the existence and content of build artifacts. Useful for ensuring that the build process is generating the expected output.

## Recommended extensions

You should use EditorConfig to follow project style.

For Visual Studio Code, [`.vscode/extensions.json`](./../.vscode/extensions.json) includes list of recommended extensions.
