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
- Alternatively download offline version for [Windows](https://github.com/undergroundwires/privacy.sexy/releases/download/0.11.3/privacy.sexy-Setup-0.11.3.exe), [macOS](https://github.com/undergroundwires/privacy.sexy/releases/download/0.11.3/privacy.sexy-0.11.3.dmg) or [Linux](https://github.com/undergroundwires/privacy.sexy/releases/download/0.11.3/privacy.sexy-0.11.3.AppImage).
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

## Development

See [development.md](./docs/development.md) for Docker usage, running/building application, development best-practices along with other information related to development of this project.

## Architecture

Check [architecture.md](./docs/architecture.md) for an overview of design and how different parts and layers work together. You can refer to [application.md](./docs/application.md) for a closer look at application layer codebase and [presentation.md](./docs/presentation.md) for code related to GUI layer. [collection-files.md](./docs/collection-files.md) explains the YAML files that are the core of the application and [templating.md](./docs/templating.md) documents how to use templating language in those files. In [ci-cd.md](./docs/ci-cd.md), you can read more about the pipelines that automates maintenance tasks and ensures you get what see.
