# Tests

There are different types of tests executed:

1. [Unit tests](#unit-tests)
2. [Integration tests](#integration-tests)
3. [End-to-end (E2E) tests](#e2e-tests)

Common aspects for all tests:

- They use [Mocha](https://mochajs.org/) and [Chai](https://www.chaijs.com/).
- Their files end with `.spec.{ts|js}` suffix.

💡 You can use path/module alias `@/tests` in import statements.

## Unit tests

- Unit tests test each component in isolation.
- All unit tests goes under [`./tests/unit`](./../tests/unit).
- They rely on [stubs](./../tests/unit/shared/Stubs) for isolation.

### Unit tests structure

- [`./src/`](./../src/)
  - Includes source code that unit tests will test.
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
      - Functions that calls `it()` from [Mocha test framework](https://mochajs.org/) should have `it` prefix.
        - E.g. `itEachAbsentCollectionValue()`.
    - [`Stubs/`](./../tests/unit/shared/Stubs)
      - Includes stubs to be able to test components in isolation.
      - Stubs have minimal and dummy behavior to be functional, they may also have spying or mocking functions.

### Unit tests naming

- Each test suite first describe the system under test.
  - E.g. tests for class `Application.ts` are all inside `Application.spec.ts`.
- `describe` blocks tests for same function (if applicable).
  - E.g. test for `run()` are inside `describe('run', () => ..)`.

### Act, arrange, assert

- Tests use act, arrange and assert (AAA) pattern when applicable.
- **Arrange**
  - Sets up the test case.
  - Starts with comment line `// arrange`.
- **Act**
  - Executes the actual test.
  - Starts with comment line `// act`.
- **Assert**
  - Elicit some sort of expectation.
  - Starts with comment line `// assert`.

## Integration tests

- Tests functionality of a component in combination with others (not isolated).
- Ensure dependencies to third parties work as expected.
- Defined in [./tests/integration](./../tests/integration).

## E2E tests

- Test the functionality and performance of a running application.
- Vue CLI plugin  [`e2e-cypress`](https://github.com/vuejs/vue-cli/tree/dev/packages/@vue/cli-plugin-e2e-cypress#readme) configures E2E tests.
- Test names and folders have logical structure based on tests executed.
- The structure is following:
  - [`cypress.json`](./../cypress.json): Cypress configuration file.
  - [`./tests/e2e/`](./../tests/e2e/): Base Cypress folder.
    - [`/specs/`](./../tests/e2e/specs/): Test files named with `.spec.js` extension.
    - [`/plugins/index.js`](./../tests/e2e/plugins/index.js): Plugin file executed before loading project.
    - [`/support/index.js`](./../tests/e2e/support/index.js): Support file, runs before every single spec file.
    - *(Ignored)* `/videos`: Asset folder for videos taken during tests.
    - *(Ignored)* `/screenshots`: Asset folder for Screenshots taken during tests.
