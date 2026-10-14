# privacy.sexy — Privacy is sexy

> Enforce privacy & security best-practices on Windows, macOS and Linux, because privacy is sexy.

<!-- markdownlint-disable MD033 -->
<p align="center">
  <a href="https://undergroundwires.dev/donate?project=privacy.sexy" target="_blank" rel="noopener noreferrer">
    <img
      alt="donation badge"
      src="https://undergroundwires.dev/img/badges/donate/flat.svg"
    />
  </a>
  <a href="./CONTRIBUTING.md" target="_blank" rel="noopener noreferrer">
    <img
      alt="contributions are welcome"
      src="https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat"
    />
  </a>
  <a href="https://codeclimate.com/github/undergroundwires/privacy.sexy/maintainability" target="_blank" rel="noopener noreferrer">
    <img
      alt="Maintainability"
      src="https://api.codeclimate.com/v1/badges/3a70b7ef602e2264342c/maintainability"
    />
  </a>
  <!-- Others -->
  <br />
  <a href="https://github.com/undergroundwires/bump-everywhere" target="_blank" rel="noopener noreferrer">
    <img
      alt="Auto-versioned by bump-everywhere"
      src="https://github.com/undergroundwires/bump-everywhere/blob/master/badge.svg?raw=true"
    />
  </a>
</p>
<!-- markdownlint-restore -->

## About this fork

This is the maintained fork of [undergroundwires/privacy.sexy](https://github.com/undergroundwires/privacy.sexy), which is no longer actively maintained.
Development continues at [sm18lr88/privacy.sexy](https://github.com/sm18lr88/privacy.sexy).
GitHub Actions is disabled here; the same checks run locally in Docker with `npm run ci:local` (see [CI/CD guide](./docs/ci-cd.md#local-ci)).

## Overview

privacy.sexy helps you review, select, and apply privacy and security settings for Windows, macOS, and Linux. Use the [web application](https://privacy.sexy) in a browser, or download a desktop release when you need to work offline.

## Get started

Choose the web app or a desktop release below, then follow [Usage](#usage).
Contributors should start with the [development guide](./docs/development.md#non-executing-validation-on-personal-computers).

## Installation

- 🌍️ **Online**: [https://privacy.sexy](https://privacy.sexy).
- 🖥️ **Offline**: Download directly for: [Windows](https://github.com/undergroundwires/privacy.sexy/releases/download/0.13.8/privacy.sexy-Setup-0.13.8.exe), [macOS](https://github.com/undergroundwires/privacy.sexy/releases/download/0.13.8/privacy.sexy-0.13.8.dmg), [Linux](https://github.com/undergroundwires/privacy.sexy/releases/download/0.13.8/privacy.sexy-0.13.8.AppImage). See also [additional install options](#additional-install-options).

See also:

- [Desktop vs. Web Features](./docs/desktop/desktop-vs-web-features.md): Differences and unique aspects of desktop and web versions.
- [System Requirements](./docs/desktop/system-requirements.md): Hardware and software requirements for the desktop version.

💡 Regularly applying your configuration with privacy.sexy is recommended, especially after each new release and major operating system updates. Each version updates scripts to enhance stability, privacy, and security.

[![privacy.sexy application](img/screenshot.png?raw=true )](https://privacy.sexy)

## Usage

1. Open the web or desktop app and choose your operating system.
2. Read each script's documentation, applicability, and warnings before selecting it.
3. Review the generated code. Selecting an option in the web app generates text; it does not apply changes to your computer.

Revert support does not recover deleted data or guarantee recovery of every system change.
Use disposable machines to test scripts, not your personal or production computer.

## Features

- **Rich**: Hundreds of scripts that aims to give you control of your data.
- **Free**: Both free as in "beer" and free as in "speech".
- **Transparent**. Have full visibility into what the tweaks do as you enable them.
- **Reversible**. Revert if something feels wrong.
- **Accessible**. No need to run any compiled software on your computer with web version.
- **Secure**: Security is a top priority at privacy.sexy with [comprehensive safeguards](./SECURITY.md#security-practices) in place.
- **Open**. What you see as code in this repository is what you get. The application itself, its infrastructure and deployments are open-source and automated thanks to [bump-everywhere](https://github.com/undergroundwires/bump-everywhere).
- **Tested**. A lot of tests. Automated and manual. Community-testing and verification. Stability improvements comes before new features.
- **Extensible**. Effortlessly [extend scripts](./CONTRIBUTING.md#extend-scripts) with a custom designed [templating language](./docs/templating.md).
- **Portable and simple**. Every script is independently executable without cross-dependencies.

## Support

**Sponsor 💕**. Consider sponsoring on [GitHub Sponsors](https://github.com/sponsors/undergroundwires), or you can donate using [other ways such as crypto or a coffee](https://undergroundwires.dev/donate/).

**Star 🤩**. Feel free to give it a star ⭐ .

**Contribute 👷**. Contributions of any type are welcome. See [CONTRIBUTING.md](./CONTRIBUTING.md) as the starting point. It includes useful information like [how to add new scripts](./CONTRIBUTING.md#extend-scripts).

## Additional Install Options

- Check the [releases page](https://github.com/undergroundwires/privacy.sexy/releases) for all available versions.
- Other unofficial channels (not maintained by privacy.sexy) for Windows include:
  - [Scoop 🥄](https://scoop.sh/#/apps?q=privacy.sexy&s=2&d=1&o=true) (latest version):

    ```powershell
      scoop bucket add extras
      scoop install privacy.sexy
    ```

  - [winget 🪟](https://winget.run/pkg/undergroundwires/privacy.sexy) (may be outdated):

    ```powershell
      winget install -e --id undergroundwires.privacy.sexy
    ```

    With winget, updates require manual submission; the auto-update feature within privacy.sexy will notify you of new releases post-installation.

## Development

Refer to [development.md](./docs/development.md) for Docker usage and reading more about setting up your development environment.

For common contributor tasks, start with:

- [Development guide](./docs/development.md): setup, safe local validation, and development commands.
- [Test guide](./docs/tests.md): test suites and their scope.
- [CI/CD guide](./docs/ci-cd.md): local Docker CI (`npm run ci:local`) and release pipelines.
- [Maintenance assessment](./docs/maintenance-assessment.md): verified maintenance work and remaining release gates.

Check [architecture.md](./docs/architecture.md) for an overview of design and how different parts and layers work together. You can refer to [application.md](./docs/application.md) for a closer look at application layer codebase and [presentation.md](./docs/presentation.md) for code related to GUI layer. [collection-files.md](./docs/collection-files.md) explains the YAML files that are the core of the application and [templating.md](./docs/templating.md) documents how to use templating language in those files. In [ci-cd.md](./docs/ci-cd.md), you can read more about the pipelines that automates maintenance tasks and ensures you get what see.

[docs/](./docs/) folder includes all other documentation.

## Contributing

Contributions are welcome. Read [CONTRIBUTING.md](./CONTRIBUTING.md) for the pull request process, testing expectations, and script contribution guidance.

## License

privacy.sexy is licensed under the [GNU Affero General Public License, version 3](./LICENSE).

## Security

Security is a top priority at privacy.sexy.
An extensive commitment to security verification ensures this priority.
For any security concerns or vulnerabilities, please consult the [Security Policy](./SECURITY.md).

## Supporters

[![Supporters appreciation banner showing the supporters](https://undergroundwires.dev/img/supporters.jpg)](https://undergroundwires.dev/supporters/)
