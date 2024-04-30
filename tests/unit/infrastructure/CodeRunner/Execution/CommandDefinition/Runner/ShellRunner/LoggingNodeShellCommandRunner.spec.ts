import { describe, it, expect } from 'vitest';
import type { Logger } from '@/application/Common/Log/Logger';
import { LoggerStub } from '@tests/unit/shared/Stubs/LoggerStub';
import { LoggingNodeShellCommandRunner } from '@/infrastructure/CodeRunner/Execution/CommandDefinition/Runner/ShellRunner/LoggingNodeShellCommandRunner';
import { SystemOperationsStub } from '@tests/unit/shared/Stubs/SystemOperationsStub';
import type { SystemOperations } from '@/infrastructure/CodeRunner/System/SystemOperations';
import { CommandOpsStub } from '@tests/unit/shared/Stubs/CommandOpsStub';
import { ChildProcessStub } from '@tests/unit/shared/Stubs/ChildProcesssStub';
import type { ShellCommandOutcome } from '@/infrastructure/CodeRunner/Execution/CommandDefinition/Runner/ShellRunner/ShellCommandRunner';

describe('LoggingNodeShellCommandRunner', () => {
  describe('logging', () => {
    it('logs on command execution', () => {
      // arrange
      const logger = new LoggerStub();
      const context = new TestContext()
        .withLogger(logger);
      const expectedLogMessage = `Executing command: ${context.command}`;
      // act
      context.runShellCommand();
      // assert
      expect(logger.assertLogsContainMessagePart('info', expectedLogMessage));
    });

    it('logs on command completion with exit code', () => {
      // arrange
      const exitCode = 31;
      const expectedLogMessage = `Command completed with exit code ${exitCode}.`;
      const logger = new LoggerStub();
      const childProcessStub = new ChildProcessStub();
      const context = new TestContext()
        .withLogger(logger)
        .withSystemOperations(createSystemOperationsWithChildProcessStub(childProcessStub));
      // act
      context.runShellCommand();
      childProcessStub.emitExit(exitCode, null);
      // assert
      expect(logger.assertLogsContainMessagePart('info', expectedLogMessage));
    });

    it('logs on command termination by a signal', async () => {
      // arrange
      const signal: NodeJS.Signals = 'SIGKILL';
      const expectedLogMessage = `Command terminated by signal: ${signal}`;
      const logger = new LoggerStub();
      const childProcessStub = new ChildProcessStub();
      const context = new TestContext()
        .withLogger(logger)
        .withSystemOperations(createSystemOperationsWithChildProcessStub(childProcessStub));
      // act
      context.runShellCommand();
      childProcessStub.emitExit(null, signal);
      // assert
      expect(logger.assertLogsContainMessagePart('warn', expectedLogMessage));
    });

    it('logs on command execution fail', async () => {
      // arrange
      const expectedErrorMessage = 'Error when executing command';
      const expectedLogMessage = 'Command execution failed:';
      const logger = new LoggerStub();
      const childProcessStub = new ChildProcessStub();
      const context = new TestContext()
        .withLogger(logger)
        .withSystemOperations(createSystemOperationsWithChildProcessStub(childProcessStub));
      // act
      context.runShellCommand();
      childProcessStub.emitError(new Error(expectedLogMessage));
      // assert
      expect(logger.assertLogsContainMessagePart('error', expectedLogMessage));
      expect(logger.assertLogsContainMessagePart('error', expectedErrorMessage));
    });
  });

  describe('return object', () => {
    it('when child process exits on its own', async () => {
      // arrange
      const expectedExitCode = 31;
      const expectedOutcomeType: ShellCommandOutcome['type'] = 'RegularProcessExit';
      const childProcessStub = new ChildProcessStub()
        .withAutoEmitExit(false);
      const context = new TestContext()
        .withSystemOperations(createSystemOperationsWithChildProcessStub(childProcessStub));
      // act
      const task = context.runShellCommand();
      childProcessStub.emitExit(expectedExitCode, null);
      const actualResult = await task;
      // assert
      expect(actualResult.type).to.equal(expectedOutcomeType);
      expect(actualResult.exitCode).to.equal(expectedExitCode);
    });
    it('when child process is terminated by a signal', async () => {
      // arrange
      const expectedTerminationSignal: NodeJS.Signals = 'SIGABRT';
      const expectedOutcomeType: ShellCommandOutcome['type'] = 'ExternallyTerminated';
      const childProcessStub = new ChildProcessStub()
        .withAutoEmitExit(false);
      const context = new TestContext()
        .withSystemOperations(createSystemOperationsWithChildProcessStub(childProcessStub));
      // act
      const task = context.runShellCommand();
      childProcessStub.emitExit(null, expectedTerminationSignal);
      const actualResult = await task;
      // assert
      expect(actualResult.type).to.equal(expectedOutcomeType);
      expect(actualResult.terminationSignal).to.equal(expectedTerminationSignal);
    });
    it('when child process has errors', async () => {
      // arrange
      const expectedError = new Error('inner error');
      const expectedOutcomeType: ShellCommandOutcome['type'] = 'ExecutionError';
      const childProcessStub = new ChildProcessStub()
        .withAutoEmitExit(false);
      const context = new TestContext()
        .withSystemOperations(createSystemOperationsWithChildProcessStub(childProcessStub));
      // act
      const task = context.runShellCommand();
      childProcessStub.emitError(expectedError);
      const actualResult = await task;
      // assert
      expect(actualResult.type).to.equal(expectedOutcomeType);
      expect(actualResult.error).to.deep.equal(expectedError);
    });
  });
});

function createSystemOperationsWithChildProcessStub(
  childProcessStub: ChildProcessStub,
): SystemOperations {
  const commandOps = new CommandOpsStub()
    .withChildProcess(childProcessStub.asChildProcess());
  return new SystemOperationsStub()
    .withCommand(commandOps);
}

class TestContext {
  public readonly command: string = 'echo "Hello from unit tests!"';

  private logger: Logger = new LoggerStub();

  private systemOps: SystemOperations = new SystemOperationsStub();

  public withLogger(logger: Logger): this {
    this.logger = logger;
    return this;
  }

  public withSystemOperations(systemOps: SystemOperations): this {
    this.systemOps = systemOps;
    return this;
  }

  public runShellCommand(): ReturnType<LoggingNodeShellCommandRunner['runShellCommand']> {
    const sut = new LoggingNodeShellCommandRunner(
      this.logger,
      this.systemOps,
    );
    return sut.runShellCommand(this.command);
  }
}
