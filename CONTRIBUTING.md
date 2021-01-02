# Contributing

- Love your input! Contributing to this project should be as easy and transparent as possible, whether it's:
  - Reporting a bug
  - Discussing the current state of the code
  - Submitting a fix
  - Proposing new features
  - Becoming a maintainer

## Pull Request Process

- [GitHub flow](https://guides.github.com/introduction/flow/index.html) is used
- Your pull requests are actively welcomed.
- The steps:
  1. Fork the repo and create your branch from master.
  2. If you've added code that should be tested, add tests.
  3. If you've changed APIs, update the documentation.
  4. Ensure the test suite passes.
  5. Make sure your code lints.
  6. Issue that pull request!
- 🙏 DO
  - Document your changes in the pull request
- ❗ DON'T
  - Do not update the versions, current version is only [set by the maintainer](./img/architecture/gitops.png) and updated automatically by [bump-everywhere](https://github.com/undergroundwires/bump-everywhere)

## Guidelines

### Handle the state in presentation layer

- There are two types of components:
  - **Stateless**, extends `Vue`
  - **Stateful**, extends [`StatefulVue`](./src/presentation/StatefulVue.ts)
    - The source of truth for the state lies in application layer (`./src/application/`) and must be updated from the views if they're mutating the state
    - They mutate or/and react to changes in [application state](src/application/Context/State/CategoryCollectionState.ts).
    - You can react by getting the state and listening to it and update the view accordingly in [`mounted()`](https://vuejs.org/v2/api/#mounted) method.

## License

By contributing, you agree that your contributions will be licensed under its GNU General Public License v3.0.
