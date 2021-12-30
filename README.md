# privacy.sexy

> Enforce privacy & security best-practices on Windows and macOS, because privacy is sexy 🍑🍆

<!-- markdownlint-disable MD033 -->
<p align="center">
  <a href="https://github.com/undergroundwires/privacy.sexy/blob/master/CONTRIBUTING.md">
    <img
      alt="contributions are welcome"
      src="https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat"
    />
  </a>
  <!-- Code quality -->
  <br />
  <a href="https://lgtm.com/projects/g/undergroundwires/privacy.sexy/context:javascript">
    <img
      alt="Language grade: JavaScript/TypeScript"
      src="https://img.shields.io/lgtm/grade/javascript/g/undergroundwires/privacy.sexy.svg?logo=lgtm&logoWidth=18"
    />
  </a>
  <a href="https://codeclimate.com/github/undergroundwires/privacy.sexy/maintainability">
    <img
      alt="Maintainability"
      src="https://api.codeclimate.com/v1/badges/3a70b7ef602e2264342c/maintainability"
    />
  </a>
  <!-- Tests -->
  <br />
  <a href="https://github.com/undergroundwires/privacy.sexy/actions/workflows/tests.unit.yaml">
    <img
      alt="Unit tests status"
      src="https://github.com/undergroundwires/privacy.sexy/workflows/unit-tests/badge.svg"
    />
  </a>
  <a href="https://github.com/undergroundwires/privacy.sexy/actions/workflows/tests.integration.yaml">
    <img
      alt="Integration tests status"
      src="https://github.com/undergroundwires/privacy.sexy/workflows/integration-tests/badge.svg"
    />
  </a>
  <a href="https://github.com/undergroundwires/privacy.sexy/actions/workflows/tests.e2e.yaml">
    <img
      alt="E2E tests status"
      src="https://github.com/undergroundwires/privacy.sexy/workflows/e2e-tests/badge.svg"
    />
  </a>
  <!-- Checks -->
  <br />
  <a href="https://github.com/undergroundwires/privacy.sexy/actions/workflows/checks.quality.yaml">
    <img
      alt="Quality checks status"
      src="https://github.com/undergroundwires/privacy.sexy/workflows/quality-checks/badge.svg"
    />
  </a>
  <a href="https://github.com/undergroundwires/privacy.sexy/actions/workflows/checks.security.yaml">
    <img
      alt="Security checks status"
      src="https://github.com/undergroundwires/privacy.sexy/workflows/security-checks/badge.svg"
    />
  </a>
  <a href="https://github.com/undergroundwires/privacy.sexy/actions/workflows/checks.build.yaml">
    <img
      alt="Build checks status"
      src="https://github.com/undergroundwires/privacy.sexy/workflows/build-checks/badge.svg"
    />
  </a>
  <!-- Release -->
  <br />
  <a href="https://github.com/undergroundwires/privacy.sexy/actions/workflows/release.git.yaml">
    <img
      alt="Git release status"
      src="https://github.com/undergroundwires/privacy.sexy/workflows/release-git/badge.svg"
    />
  </a>
  <a href="https://github.com/undergroundwires/privacy.sexy/actions/workflows/release.site.yaml">
    <img
      alt="Site release status"
      src="https://github.com/undergroundwires/privacy.sexy/workflows/release-site/badge.svg"
    />
  </a>
  <a href="https://github.com/undergroundwires/privacy.sexy/actions/workflows/release.desktop.yaml">
    <img
      alt="Desktop application release status"
      src="https://github.com/undergroundwires/privacy.sexy/workflows/release-desktop/badge.svg"
    />
  </a>
  <!-- Others -->
  <br />
  <a href="https://github.com/undergroundwires/bump-everywhere">
    <img
      alt="Auto-versioned by bump-everywhere"
      src="https://github.com/undergroundwires/bump-everywhere/blob/master/badge.svg?raw=true"
    />
  </a>
</p>
<!-- markdownlint-restore -->

## Get started

- Online version at [https://privacy.sexy](https://privacy.sexy)
  - 💡 No need to run any compiled software on your computer.
- Alternatively download offline version for [Windows](https://github.com/undergroundwires/privacy.sexy/releases/download/0.11.2/privacy.sexy-Setup-0.11.2.exe), [macOS](https://github.com/undergroundwires/privacy.sexy/releases/download/0.11.2/privacy.sexy-0.11.2.dmg) or [Linux](https://github.com/undergroundwires/privacy.sexy/releases/download/0.11.2/privacy.sexy-0.11.2.AppImage).
  - 💡 Single click to execute your script.
- ❗ Come back regularly to apply latest version for stronger privacy and security.

[![privacy.sexy application](img/screenshot.png?raw=true)](https://privacy.sexy)

## Why

- Rich tweak pool to harden security & privacy of the OS and other software on it
- Free (both free as in beer and free as in speech)
- No need to run any compiled software that has access to your system, just run the generated scripts
- Have full visibility into what the tweaks do as you enable them
- Ability to revert (undo) applied scripts
- Everything is transparent: both application and its infrastructure are open-source and automated
- Easily extendable with [own powerful templating language](./docs/templating.md)
- Each script is independently executable without cross-dependencies

## Extend scripts

- You can either [create an issue](https://github.com/undergroundwires/privacy.sexy/issues/new/choose)
- Or send a PR:
  1. Fork the repository
  2. Add more scripts in respective script collection in [collections](src/application/collections/) folder.
     - 📖 If you're unsure about the syntax you can refer to the [collection files | documentation](docs/collection-files.md).
     - 🙏 For any new script, please add `revertCode` and `docs` values if possible.
  3. Send a pull request 👌

## Commands

- Project setup: `npm install`
- Testing
  - Run unit tests: `npm run test:unit`
  - Run integration tests: `npm run test:integration`
  - Run e2e (end-to-end) tests
    - Interactive mode with GUI: `npm run test:e2e`
    - Headless mode without GUI: `npm run test:e2e -- --headless`
  - Lint: `npm run lint`
- **Desktop app**
  - Development: `npm run electron:serve`
  - Production: `npm run electron:build` to build an executable
- **Webpage**
  - Development: `npm run serve` to compile & hot-reload for development.
  - Production: `npm run build` to prepare files for distribution.
  - Or run using Docker:
    1. Build: `docker build -t undergroundwires/privacy.sexy:0.11.2 .`
    2. Run: `docker run -it -p 8080:80 --rm --name privacy.sexy-0.11.2 undergroundwires/privacy.sexy:0.11.2`

## Architecture overview

### Application

- Powered by **TypeScript**, **Vue.js** and **Electron** 💪
  - and driven by **Domain-driven design**, **Event-driven architecture**, **Data-driven programming** concepts.
- Application uses highly decoupled models & services in different DDD layers.
- 📖 Read more on • [Presentation](./docs/presentation.md) • [Application](./docs/application.md)

![DDD + vue.js](img/architecture/app-ddd.png)

### AWS Infrastructure

[![AWS solution](img/architecture/aws-solution.png)](https://github.com/undergroundwires/aws-static-site-with-cd)

- It uses infrastructure from the following repository: [aws-static-site-with-cd](https://github.com/undergroundwires/aws-static-site-with-cd)
  - Runs on AWS 100% serverless and automatically provisioned using [GitHub Actions](.github/workflows/).
  - Maximum security & automation and minimum AWS costs are the highest priorities of the design.

#### GitOps: CI/CD to AWS

- CI/CD is fully automated for this repo using different GIT events & GitHub actions.
  - Versioning, tagging, creation of `CHANGELOG.md` and releasing is automated using [bump-everywhere](https://github.com/undergroundwires/bump-everywhere) action
- Everything that's merged in the master goes directly to production.
- 📖 Read more on [CI/CD pipelines](./docs/ci-cd.md)

[![CI/CD to AWS with GitHub Actions](img/architecture/gitops.png)](.github/workflows/)
