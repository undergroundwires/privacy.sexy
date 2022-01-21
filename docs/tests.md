# Tests

- There are two different types of tests executed:
  1. [Unit tests](#unit-tests)
  2. [Integration tests](#integration-tests)
  3. [End-to-end (E2E) tests](#e2e-tests)
- All tests
  - Uses [Mocha](https://mochajs.org/) and [Chai](https://www.chaijs.com/).
  - Are written in files that includes `.spec` extension.
- 💡 You can use path/module alias `@/tests` in import statements.

## Unit tests

- Tests each component in isolation.
- Defined in [`./tests/unit`](./../tests/unit).

### Unit tests structure

- [`./src/`](./../src/)
  - Includes code that will be tested tested.
- [`./tests/unit/`](./../tests/unit/)
  - Includes test code.
  - Tests follow same folder structure as [`./src/`](./../src).
    - E.g. if system under test lies in [`./src/application/ApplicationFactory.ts`](./../src/application/ApplicationFactory.ts) then its tests would be in test would be at [`./tests/unit/application/ApplicationFactory.spec.ts`](./../tests/unit/application/ApplicationFactory.spec.ts).
  - [`shared/`](./../tests/unit/shared/)
    - Includes common functionality that's shared across unit tests.
    - [`Assertions/`](./../tests/unit/shared/Assertions):
      - Common assertions that extend [Chai Assertion Library](https://www.chaijs.com/).
      - Asserting functions should start with `expect` prefix.
    - [`TestCases/`](./../tests/unit/shared/TestCases/)
      - Shared test cases.
      - Test runner functions that uses `it()` from Mocha test [Mocha test framework](https://mochajs.org/) should be prefixed with `it.`
        - E.g. `itEachAbsentCollectionValue()`.
  - [`stubs/`](./../tests/unit/stubs)
    - Includes stubs to be able to test classes in isolation.
    - They implement dummy behavior to be functional with optionally spying or mocking functions.

### Unit tests naming

- Each test suite first describe the system under test.
  - E.g. tests for class `Application` is categorized under `Application`.
- Tests for specific methods are categorized under method name (if applicable).
  - E.g. test for `run()` is categorized under `run`.

### Act, arrange, assert

- Tests use act, arrange and assert (AAA) pattern when applicable.
- **Arrange**
  - Should set up the test case.
  - Starts with comment line `// arrange`.
- **Act**
  - Should cover the main thing to be tested.
  - Starts with comment line `// act`.
- **Assert**
  - Should elicit some sort of response.
  - Starts with comment line `// assert`.

## Integration tests

- Tests functionality of a component in combination with others (not isolated).
- Ensure dependencies to third parties work as expected.
- Defined in [`./tests/integration`](./../tests/integration).

## E2E tests

- Test the functionality and performance of a running application.
- E2E tests are configured by vue plugin [`e2e-cypress`](https://github.com/vuejs/vue-cli/tree/dev/packages/@vue/cli-plugin-e2e-cypress#readme) for Vue CLI.
- Names and folders are structured logically based on tests.
- The structure is following:
  - [`cypress.json`](./../cypress.json): Cypress configuration file.
  - [`./tests/e2e/`](./../tests/e2e/): Base Cypress folder.
    - [`/specs/`](./../tests/e2e/specs/): Test files, test are named with `.spec.js` extension.
    - [`/plugins/index.js`](./../tests/e2e/plugins/index.js): Plugin file executed before project is loaded.
    - [`/support/index.js`](./../tests/e2e/support/index.js): Support file, runs before every single spec file.
    - *(Ignored)* `/videos`: Asset folder for videos taken during tests.
    - *(Ignored)* `/screenshots`: Asset folder for Screenshots taken during tests.
