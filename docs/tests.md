# Tests

There are different types of tests executed:

1. [Unit tests](#unit-tests)
2. [Integration tests](#integration-tests)
3. [End-to-end (E2E) tests](#e2e-tests)
4. [Automated checks](#automated-checks)

## Unit and integration tests

- They utilize [Vitest](https://vitest.dev/).
- Test files are suffixed with `.spec.ts`.

### Act, arrange, assert

- Tests implement the act, arrange, and assert (AAA) pattern.
- **Arrange**
  - Sets up the test scenario and environment.
  - Begins with comment line `// arrange`.
- **Act**
  - Executes the actual test.
  - Begins with comment line `// act`.
- **Assert**
  - Sets an expectation for the test's outcome.
  - Begins with comment line `// assert`.

### Unit tests

- Evaluate individual components in isolation.
- Located in [`./tests/unit`](./../tests/unit).
- Achieve isolation using [stubs](./../tests/unit/shared/Stubs).
- Include Vue component tests, enabled by `@vue/test-utils`.

#### Unit tests naming

- Test suites start with a description of the component or system under test.
  - E.g., tests for `Application.ts` are contained in `Application.spec.ts`.
- Whenever possible, `describe` blocks group tests of the same function.
  - E.g., tests for `run()` are inside `describe('run', () => ...)`.

### Integration tests

- Assess the combined functionality of components.
- They verify that third-party dependencies function as anticipated.

## E2E tests

- Examine the live web application's functionality and performance.
- Configured with the Vue CLI plugin [`e2e-cypress`](https://github.com/vuejs/vue-cli/tree/dev/packages/@vue/cli-plugin-e2e-cypress#readme).

## Automated checks

These checks validate various qualities like runtime execution, building process, security testing, etc.

- Use [various tools](./../package.json) and [scripts](./../scripts).
- Are automatically executed as [GitHub workflows](./../.github/workflows).

## Tests structure

- [`package.json`](./../package.json): Defines test commands and includes tools used in tests.
- [`vite.config.ts`](./../vite.config.ts): Configures `vitest` for unit and integration tests.
- [`./src/`](./../src/): Contains the source code subject to testing.
- **[`./tests/bootstrap/setup.ts`](./../tests/bootstrap/setup.ts)**: Initializes tests.
- **[`./tests/unit/`](./../tests/unit/)**
  - Stores unit test code.
  - The directory structure mirrors [`./src/`](./../src).
    - E.g., tests for [`./src/application/ApplicationFactory.ts`](./../src/application/ApplicationFactory.ts) reside in [`./tests/unit/application/ApplicationFactory.spec.ts`](./../tests/unit/application/ApplicationFactory.spec.ts).
  - [`shared/`](./../tests/unit/shared/)
    - Contains shared unit test functionalities.
    - [`Assertions/`](./../tests/unit/shared/Assertions): Contains common assertion functions, prefixed with `expect`.
    - [`TestCases/`](./../tests/unit/shared/TestCases/)
      - Shared test cases.
      - Functions that calls `it()` from [Vitest](https://vitest.dev/) should have `it` prefix.
    - [`Stubs/`](./../tests/unit/shared/Stubs): Maintains stubs for component isolation, equipped with basic functionalities and, when necessary, spying or mocking capabilities.
- **[`./tests/integration/`](./../tests/integration/)**: Contains integration test files.
- **[`./tests/e2e/`](./../tests/e2e/)**
  - [`cypress.config.ts`](./../cypress.config.ts): Cypress configuration file.
  - [`./tests/e2e/`](./../tests/e2e/): Base Cypress folder.
    - [`/specs/`](./../tests/e2e/specs/): Test files named with `.spec.js` extension.
    - [`/plugins/index.js`](./../tests/e2e/plugins/index.js): Plugin file executed before loading project.
    - [`/support/index.js`](./../tests/e2e/support/index.js): Support file, runs before every single spec file.
    - *(Ignored)* `/videos`: Asset folder for videos taken during tests.
    - *(Ignored)* `/screenshots`: Asset folder for Screenshots taken during tests.
