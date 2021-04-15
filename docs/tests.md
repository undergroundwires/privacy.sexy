# Tests

- 💡 You can use path/module alias `@/tests` in import statements.

## Unit tests

- Unit tests are defined in [`./tests`](./../tests)
- They follow same folder structure as [`./src`](./../src)

### Naming

- Each test suite first describe the system under test
  - E.g. tests for class `Application` is categorized under `Application`
- Tests for specific methods are categorized under method name (if applicable)
  - E.g. test for `run()` is categorized under `run`

### Act, arrange, assert

- Tests use act, arrange and assert (AAA) pattern when applicable
- **Arrange**
  - Should set up the test case
  - Starts with comment line `// arrange`
- **Act**
  - Should cover the main thing to be tested
  - Starts with comment line `// act`
- **Assert**
  - Should elicit some sort of response
  - Starts with comment line `// assert`

### Stubs

- Stubs are defined in [`./tests/stubs`](./../tests/unit/stubs)
- They implement dummy behavior to be functional
