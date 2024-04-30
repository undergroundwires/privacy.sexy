import { describe, it, expect } from 'vitest';
import { LinuxVisibleTerminalCommand } from '@/infrastructure/CodeRunner/Execution/CommandDefinition/Commands/LinuxVisibleTerminalCommand';
import type { ShellArgumentEscaper } from '@/infrastructure/CodeRunner/Execution/CommandDefinition/Commands/ShellArgument/ShellArgumentEscaper';
import { ShellArgumentEscaperStub } from '@tests/unit/shared/Stubs/ShellArgumentEscaperStub';

describe('LinuxVisibleTerminalCommand', () => {
  describe('buildShellCommand', () => {
    it('returns expected command for given escaped file path', () => {
      // arrange
      const escapedFilePath = '/escaped/file/path';
      const expectedCommand = `x-terminal-emulator -e ${escapedFilePath}`;
      const escaper = new ShellArgumentEscaperStub();
      escaper.escapePathArgument = () => escapedFilePath;
      const sut = new CommandBuilder()
        .withEscaper(escaper)
        .build();
      // act
      const actualCommand = sut.buildShellCommand('unimportant');
      // assert
      expect(actualCommand).to.equal(expectedCommand);
    });
    it('escapes provided file path correctly', () => {
      // arrange
      const expectedFilePath = '/input';
      const escaper = new ShellArgumentEscaperStub();
      const sut = new CommandBuilder()
        .withEscaper(escaper)
        .build();
      // act
      sut.buildShellCommand(expectedFilePath);
      // assert
      expect(escaper.callHistory).to.have.lengthOf(1);
      const [actualFilePath] = escaper.callHistory[0].args;
      expect(actualFilePath).to.equal(expectedFilePath);
    });
  });
  describe('isExecutionTerminatedExternally', () => {
    const testScenarios: readonly {
      readonly givenExitCode: number;
      readonly expectedResult: boolean;
    }[] = [
      {
        givenExitCode: 137,
        expectedResult: true,
      },
    ];
    testScenarios.forEach((
      { givenExitCode, expectedResult },
    ) => {
      it(`returns ${expectedResult} for exit code ${givenExitCode}`, () => {
        // arrange
        const expectedValue = true;
        const sut = new CommandBuilder().build();
        // act
        const actualValue = sut.isExecutionTerminatedExternally(givenExitCode);
        // assert
        expect(expectedValue).to.equal(actualValue);
      });
    });
  });
  describe('isExecutablePermissionsRequiredOnFile', () => {
    it('returns true', () => {
      // arrange
      const expectedValue = true;
      const sut = new CommandBuilder().build();
      // act
      const actualValue = sut.isExecutablePermissionsRequiredOnFile();
      // assert
      expect(expectedValue).to.equal(actualValue);
    });
  });
});

class CommandBuilder {
  private escaper: ShellArgumentEscaper = new ShellArgumentEscaperStub();

  public withEscaper(escaper: ShellArgumentEscaper): this {
    this.escaper = escaper;
    return this;
  }

  public build(): LinuxVisibleTerminalCommand {
    return new LinuxVisibleTerminalCommand(
      this.escaper,
    );
  }
}
