import type { ShellArgumentEscaper } from '@/infrastructure/CodeRunner/Execution/CommandDefinition/Commands/ShellArgument/ShellArgumentEscaper';

export function runEscapeTests(
  escaperFactory: () => ShellArgumentEscaper,
  testScenarios: ReadonlyArray<{
    readonly description: string;
    readonly givenPath: string;
    readonly expectedPath: string;
  }>,
) {
  testScenarios.forEach(({
    description, givenPath, expectedPath,
  }) => {
    it(description, () => {
      // arrange
      const escaper = escaperFactory();
      // act
      const actualPath = escaper.escapePathArgument(givenPath);
      // assert
      expect(actualPath).to.equal(expectedPath);
    });
  });
}
