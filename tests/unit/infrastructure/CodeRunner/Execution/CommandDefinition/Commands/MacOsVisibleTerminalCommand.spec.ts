import { describe, it, expect } from 'vitest';
import { MacOsVisibleTerminalCommand } from '@/infrastructure/CodeRunner/Execution/CommandDefinition/Commands/MacOsVisibleTerminalCommand';
import type { ShellArgumentEscaper } from '@/infrastructure/CodeRunner/Execution/CommandDefinition/Commands/ShellArgument/ShellArgumentEscaper';
import { ShellArgumentEscaperStub } from '@tests/unit/shared/Stubs/ShellArgumentEscaperStub';

describe('MacOsVisibleTerminalCommand', () => {
  describe('buildShellCommand', () => {
    it('returns expected command for given escaped file path', () => {
      // arrange
      const escapedFilePath = '/escaped/file/path';
      const expectedCommand = `open -a Terminal.app ${escapedFilePath}`;
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
    it('returns `false`', () => {
      // arrange
      const expectedValue = false;
      const sut = new CommandBuilder().build();
      // act
      const actualValue = sut.isExecutionTerminatedExternally();
      // assert
      expect(expectedValue).to.equal(actualValue);
    });
  });
  describe('isExecutablePermissionsRequiredOnFile', () => {
    it('returns `true`', () => {
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

  public build(): MacOsVisibleTerminalCommand {
    return new MacOsVisibleTerminalCommand(
      this.escaper,
    );
  }
}
