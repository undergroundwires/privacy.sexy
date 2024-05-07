import { describe, it, expect } from 'vitest';
import { WindowsVisibleTerminalCommand } from '@/infrastructure/CodeRunner/Execution/CommandDefinition/Commands/WindowsVisibleTerminalCommand';
import type { ShellArgumentEscaper } from '@/infrastructure/CodeRunner/Execution/CommandDefinition/Commands/ShellArgument/ShellArgumentEscaper';
import { ShellArgumentEscaperStub } from '@tests/unit/shared/Stubs/ShellArgumentEscaperStub';
import type { Logger } from '@/application/Common/Log/Logger';
import { LoggerStub } from '@tests/unit/shared/Stubs/LoggerStub';
import type { PowerShellInvokeShellCommandCreator } from '@/infrastructure/CodeRunner/Execution/CommandDefinition/Commands/PowerShellInvoke/PowerShellInvokeShellCommandCreator';
import { PowerShellInvokeShellCommandCreatorStub } from '@tests/unit/shared/Stubs/PowerShellInvokeShellCommandCreatorStub';
import { expectExists } from '@tests/shared/Assertions/ExpectExists';

describe('WindowsVisibleTerminalCommand', () => {
  describe('buildShellCommand', () => {
    it('creates a PowerShell command with the escaped path', () => {
      // arrange
      const escapedFilePath = '/escaped/file/path';
      const expectedCommand = `Start-Process -Verb RunAs -FilePath ${escapedFilePath}`;
      const escaper = new ShellArgumentEscaperStub();
      escaper.escapePathArgument = () => escapedFilePath;
      const powerShellCommandCreator = new PowerShellInvokeShellCommandCreatorStub();
      const sut = new CommandBuilder()
        .withEscaper(escaper)
        .withPowerShellCommandCreator(powerShellCommandCreator)
        .build();
      // act
      sut.buildShellCommand('unimportant');
      // assert
      const calls = powerShellCommandCreator.callHistory.filter((c) => c.methodName === 'createCommandToInvokePowerShell');
      expect(calls).to.have.lengthOf(1);
      const [actualCommand] = calls[0].args;
      expect(actualCommand).to.equal(expectedCommand);
    });
    it('returns a command to invoke PowerShell', () => {
      // arrange
      const expectedCommand = 'expected command from creator';
      const powerShellCommandCreator = new PowerShellInvokeShellCommandCreatorStub();
      powerShellCommandCreator.createCommandToInvokePowerShell = () => expectedCommand;
      const sut = new CommandBuilder()
        .withPowerShellCommandCreator(powerShellCommandCreator)
        .build();
      // act
      const actualCommand = sut.buildShellCommand('unimportant');
      // assert
      expect(actualCommand).to.equal(expectedCommand);
    });
    it('logs the powershell command', () => {
      // arrange
      let expectedCommand: string | undefined;
      const powerShellCommandCreator = new PowerShellInvokeShellCommandCreatorStub();
      powerShellCommandCreator.createCommandToInvokePowerShell = (command) => {
        expectedCommand = command;
        return 'unimportant command';
      };
      const logger = new LoggerStub();
      const sut = new CommandBuilder()
        .withLogger(logger)
        .withPowerShellCommandCreator(powerShellCommandCreator)
        .build();
      // act
      sut.buildShellCommand('unimportant');
      // assert
      expectExists(expectedCommand);
      logger.assertLogsContainMessagePart('info', expectedCommand);
    });
    it('escapes the provided file path', () => {
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
    it('returns `false`', () => {
      // arrange
      const expectedValue = false;
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

  private logger: Logger = new LoggerStub();

  private powerShellCommandCreator
  : PowerShellInvokeShellCommandCreator = new PowerShellInvokeShellCommandCreatorStub();

  public withEscaper(escaper: ShellArgumentEscaper): this {
    this.escaper = escaper;
    return this;
  }

  public withPowerShellCommandCreator(
    powerShellCommandCreator: PowerShellInvokeShellCommandCreator,
  ): this {
    this.powerShellCommandCreator = powerShellCommandCreator;
    return this;
  }

  public withLogger(logger: Logger): this {
    this.logger = logger;
    return this;
  }

  public build(): WindowsVisibleTerminalCommand {
    return new WindowsVisibleTerminalCommand(
      this.escaper,
      this.powerShellCommandCreator,
      this.logger,
    );
  }
}
