# Contributing

Love your input ❤️! Contributing to this project should be as easy and transparent as possible, whether it's:

- reporting a bug,
- discussing the current state of the code,
- submitting a fix,
- proposing new features,
- or becoming a maintainer.

As a small open source project with small community, it can sometimes take a long time to address the issues so please be patient.

## Pull request process

Your pull requests are actively welcomed. We collaborate using [GitHub flow](https://web.archive.org/web/20250317121135/https://docs.github.com/en/get-started/using-github/github-flow).

The steps:

1. Fork the repository and create your branch from `master`.
2. If you've added code that requires testing, add tests. See [tests.md](./docs/tests.md).
3. If you've done a major change, update the documentation. See [docs/](./docs/).
4. Ensure the test suite passes. See [development.md | Testing](./docs/development.md#testing) for commands.
5. Make sure your code lints.See [development.md | Linting](./docs/development.md#linting) for commands.
6. Issue that pull request!

**🙏 DO:**

- Document why (what you're trying to solve) rather than what in the pull request.

**❗ DON'T:**

- Do not update the versions, current version is [set by the maintainer](./docs/ci-cd.md#gitops) and updated automatically by [bump-everywhere](https://github.com/undergroundwires/bump-everywhere).

Automated pipelines will run to control your PR and they will publish your code once the maintainer merges your PR.

📖 You can read more in [ci-cd.md](./docs/ci-cd.md).

## Extend scripts

If you're interested in adding new scripts to privacy.sexy:

1. Read [guidelines for a good script](./docs/script-guidelines.md)
2. Choose one of two ways to contribute:
   1. [Create an issue](https://github.com/undergroundwires/privacy.sexy/issues/new/choose) requesting the addition of a new script. This allows other contributors to develop and add it for you. This will take longer time.
   2. Submit a pull request with your script. This is the faster route to seeing your script included in the project. Add your scripts to the appropriate OS directory in the [collections](src/application/collections/) (for syntax guidance, see [collection-files.md](docs/collection-files.md)) folder, and follow the [pull request process](#pull-request-process).

## Commit conventions

- Adhere to the 50/72 rule:
  - Commit titles should not exceed 50 characters.
  - Limit description lines to 72 characters, except for code blocks or inline codes.
- Avoid including delta (such as `git diff` information) or a list of changed files in the commit message. This information is redundant as it's already part of the commit.
- Focus on explaining the WHY and HOW of the changes, rather than WHAT changes are.
- Begin the commit message with a concise summary of what the commit accomplishes.
- Use imperative language in the commit title. For example, use "add" instead of "added".
- Commit prefixes:
  - Prefix bug fixes with `fix:` or `Fix ...`.
  - For commits affecting scripts of specific operating systems:
    - Prefix the commit title with an OS-specific tag such as `win:` for Windows scripts, `mac:` for macOS scripts, and `linux:` for Linux scripts.
    - Combine prefixes for commits affecting more than one operating system, e.g., `win, mac: ...`.

## Versioning

We base versioning on the release's content rather than strictly following semantic versioning.

There are two main types of releases:

1. **Patch Releases:** These focus on minor UI improvements, bug fixes, refactorings, dependency updates, and documentation updates. For scripts, they involve adjusting recommendation levels, enhancing functionality, and dividing scripts for more precise control. Patch releases may ship minor feature additions if they are essential for fixing a bug. For these updates, we increment the patch number in the `MAJOR.MINOR.PATCH`.

2. **Feature Releases:** These releases bring significant updates that change how users interact with privacy.sexy. They include major UI enhancements, the introduction of new scripts, and features. For these updates, we increment the minor number in the `MAJOR.MINOR.PATCH`.

Maintainers tag specific commits with a version number to trigger a release, and [bump-everywhere](https://github.com/undergroundwires/bump-everywhere) automates the release process including updating version numbers throughout the project.

## Refactoring

Opportunistic refactoring is welcome. If you're adding a feature or fixing a bug, feel free to also clean up and optimize the related code. Your contributions should leave the code in a better state than when you found it.

## License

By contributing to this project, you agree that your contributions are licensed under the [GNU Affero General Public License](./LICENSE) as currently specified. Additionally, you expressly consent to the project maintainers having full authority to modify the licensing terms or relicense your contributions under different terms in the future.
