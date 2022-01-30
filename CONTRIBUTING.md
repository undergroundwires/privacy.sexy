# Contributing

Love your input! Contributing to this project should be as easy and transparent as possible, whether it's:

- reporting a bug,
- discussing the current state of the code,
- submitting a fix,
- proposing new features,
- or becoming a maintainer.

As a small open source project with small community, it can sometimes take a long time to address the issues so please be patient.

## Pull request process

Your pull requests are actively welcomed. We collaborate using [GitHub flow](https://docs.github.com/en/get-started/quickstart/github-flow).

The steps:

1. Fork the repo and create your branch from master.
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

Here's quick information for you who want to add more scripts.

You have two alternatives:

1. [Create an issue](https://github.com/undergroundwires/privacy.sexy/issues/new/choose) and ask for someone else to add the script for you.
2. Or send a PR yourself. This would make it faster to get your code into the project. You need to add scripts to related OS in [collections](src/application/collections/) folder. Then you'd sent a pull request, see [pull request process](#pull-request-process).
   - 📖 If you're unsure about the syntax, check [collection-files.md](docs/collection-files.md).
   - 📖 If you wish to use templates, use [templating.md](./docs/templating.md).

## License

By contributing, you agree that your [GNU General Public License v3.0](./LICENSE) will be the license for your contributions.
