# Development

Before your commit, a good practice is to:

1. [Run unit tests](#testing)
2. [Lint your code](#linting)

You could run other types of tests as well, but they may take longer time and overkill for your changes. Automated actions executes the tests for a pull request or change in the main branch. See [ci-cd.md](./ci-cd.md) for more information.

## Commands

### Prerequisites

- Install node >15.x.
- Install dependencies using `npm install`.

### Testing

- Run unit tests: `npm run test:unit`
- Run integration tests: `npm run test:integration`
- Run e2e (end-to-end) tests
  - Interactive mode with GUI: `npm run test:e2e`
  - Headless mode without GUI: `npm run test:e2e -- --headless`

📖 Read more about testing in [tests](./tests.md).

### Linting

- Lint all (recommended 💡): `npm run lint`
- Markdown: `npm run lint:md`
- Markdown consistency `npm run lint:md:consistency`
- Markdown relative URLs: `npm run lint:md:relative-urls`
- JavaScript/TypeScript: `npm run lint:eslint`
- Yaml: `npm run lint:yaml`

### Running

- Run in local server: `npm run serve`
  - 💡 Meant for local development with features such as hot-reloading.
- Run using Docker:
  1. Build: `docker build -t undergroundwires/privacy.sexy:latest .`
  2. Run: `docker run -it -p 8080:80 --rm --name privacy.sexy undergroundwires/privacy.sexy:latest`

### Building

- Build web application: `npm run build`
- Build desktop application: `npm run electron:build`
- (Re)create icons (see [documentation](../img/README.md)): `npm run create-icons`

### Utility Scripts

- Run fresh NPM install: [`./scripts/fresh-npm-install.sh`](../scripts/fresh-npm-install.sh)
  - This script provides a clean NPM install, removing existing node modules and optionally the package-lock.json (when run with -n), then installs dependencies and runs unit tests.
- Configure VSCode: [`./scripts/configure-vscode.sh`](../scripts/configure-vscode.sh)
  - This script checks and sets the necessary configurations for VSCode in `settings.json` file.

## Recommended extensions

You should use EditorConfig to follow project style.

For Visual Studio Code, [`.vscode/extensions.json`](./../.vscode/extensions.json) includes list of recommended extensions.
