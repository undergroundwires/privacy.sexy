import { describe, it, expect } from 'vitest';
import type { Logger } from '@/application/Common/Log/Logger';
import type { CommandDefinitionFactory } from '@/infrastructure/CodeRunner/Execution/CommandDefinition/Factory/CommandDefinitionFactory';
import { VisibleTerminalFileRunner } from '@/infrastructure/CodeRunner/Execution/VisibleTerminalFileRunner';
import { LoggerStub } from '@tests/unit/shared/Stubs/LoggerStub';
import { CommandDefinitionRunnerStub } from '@tests/unit/shared/Stubs/CommandDefinitionRunnerStub';
import type { CommandDefinitionRunner } from '@/infrastructure/CodeRunner/Execution/CommandDefinition/Runner/CommandDefinitionRunner';
import type { ScriptFileExecutionOutcome } from '@/infrastructure/CodeRunner/Execution/ScriptFileExecutor';
import type { CodeRunErrorType } from '@/application/CodeRunner/CodeRunner';
import { expectExists } from '@tests/shared/Assertions/ExpectExists';
import { CommandDefinitionStub } from '@tests/unit/shared/Stubs/CommandDefinitionStub';
import { CommandDefinitionFactoryStub } from '@tests/unit/shared/Stubs/CommandDefinitionFactoryStub';

describe('VisibleTerminalFileRunner', () => {
  describe('executeScriptFile', () => {
    describe('logging', () => {
      it('logs execution start', async () => {
        // arrange
        const filePath = '/file/in/logs';
        const expectedLog = `Executing script file: ${filePath}.`;
        const logger = new LoggerStub();
        const context = new TestContext()
          .withFilePath(filePath)
          .withLogger(logger);
        // act
        await context.executeScriptFile();
        // assert
        logger.assertLogsContainMessagePart('info', expectedLog);
      });

      it('logs if command factory throws', async () => {
        // arrange
        const errorFromCommandFactory = 'Expected error from command factory';
        const expectedLogMessage = 'Failed to execute the script file in terminal.';
        const expectedLogErrorType: CodeRunErrorType = 'UnsupportedPlatform';
        const expectedLogErrorMessage = `Error finding command: ${errorFromCommandFactory}`;
        const commandFactory = new CommandDefinitionFactoryStub();
        commandFactory.provideCommandDefinition = () => {
          throw new Error(errorFromCommandFactory);
        };
        const logger = new LoggerStub();
        const context = new TestContext()
          .withCommandFactory(commandFactory)
          .withLogger(logger);
        // act
        await context.executeScriptFile();
        // assert
        logger.assertLogsContainMessagePart('error', expectedLogMessage);
        logger.assertLogsContainMessagePart('error', expectedLogErrorType);
        logger.assertLogsContainMessagePart('error', expectedLogErrorMessage);
      });

      it('logs if command runner throws', async () => {
        // arrange
        const errorFromCommandRunner = 'Expected error from command runner';
        const expectedLogMessage = 'Failed to execute the script file in terminal.';
        const expectedLogErrorType: CodeRunErrorType = 'FileExecutionError';
        const expectedLogErrorMessage = `Unexpected error: ${errorFromCommandRunner}`;
        const commandRunner = new CommandDefinitionRunnerStub();
        commandRunner.runCommandDefinition = () => {
          throw new Error(errorFromCommandRunner);
        };
        const logger = new LoggerStub();
        const context = new TestContext()
          .withCommandRunner(commandRunner)
          .withLogger(logger);
        // act
        await context.executeScriptFile();
        // assert
        logger.assertLogsContainMessagePart('error', expectedLogMessage);
        logger.assertLogsContainMessagePart('error', expectedLogErrorType);
        logger.assertLogsContainMessagePart('error', expectedLogErrorMessage);
      });

      it('logs if command runner returns error', async () => {
        // arrange
        const expectedLogMessage = 'Failed to execute the script file in terminal.';
        const expectedLogErrorType: CodeRunErrorType = 'ExternalProcessTermination';
        const expectedLogErrorMessage = 'Expected error from command runner';
        const errorFromCommandRunner: ScriptFileExecutionOutcome = {
          success: false,
          error: {
            type: expectedLogErrorType,
            message: expectedLogErrorMessage,
          },
        };
        const commandRunner = new CommandDefinitionRunnerStub()
          .withOutcome(errorFromCommandRunner);
        const logger = new LoggerStub();
        const context = new TestContext()
          .withCommandRunner(commandRunner)
          .withLogger(logger);
        // act
        context.executeScriptFile();
        // assert
        logger.assertLogsContainMessagePart('error', expectedLogMessage);
        logger.assertLogsContainMessagePart('error', expectedLogErrorType);
        logger.assertLogsContainMessagePart('error', expectedLogErrorMessage);
      });
    });

    describe('returns correct outcome', () => {
      it('returns success on happy path', async () => {
        // arrange
        const context = new TestContext();
        // act
        const outcome = await context.executeScriptFile();
        // assert
        expect(outcome.success).to.equal(true);
      });

      it('returns error when command factory throws', async () => {
        // arrange
        const errorFromCommandFactory = 'Expected error from command factory';
        const expectedErrorType: CodeRunErrorType = 'UnsupportedPlatform';
        const expectedErrorMessage = `Error finding command: ${errorFromCommandFactory}`;
        const commandFactory = new CommandDefinitionFactoryStub();
        commandFactory.provideCommandDefinition = () => {
          throw new Error(errorFromCommandFactory);
        };
        const context = new TestContext()
          .withCommandFactory(commandFactory);
        // act
        const outcome = await context.executeScriptFile();
        // assert
        expect(outcome.success).to.equal(false);
        expectExists(outcome.error);
        expect(outcome.error.message).to.equal(expectedErrorMessage);
        expect(outcome.error.type).to.equal(expectedErrorType);
      });

      it('returns error when command runner throws', async () => {
        // arrange
        const errorFromCommandRunner = 'Expected error from command runner';
        const expectedErrorType: CodeRunErrorType = 'FileExecutionError';
        const expectedErrorMessage = `Unexpected error: ${errorFromCommandRunner}`;
        const commandRunner = new CommandDefinitionRunnerStub();
        commandRunner.runCommandDefinition = () => {
          throw new Error(errorFromCommandRunner);
        };
        const context = new TestContext()
          .withCommandRunner(commandRunner);
        // act
        const outcome = await context.executeScriptFile();
        // assert
        expect(outcome.success).to.equal(false);
        expectExists(outcome.error);
        expect(outcome.error.message).to.equal(expectedErrorMessage);
        expect(outcome.error.type).to.equal(expectedErrorType);
      });

      it('returns error when command runner returns error', async () => {
        // arrange
        const expectedOutcome: ScriptFileExecutionOutcome = {
          success: false,
          error: {
            type: 'FileExecutionError',
            message: 'Expected error from command runner',
          },
        };
        const commandRunner = new CommandDefinitionRunnerStub()
          .withOutcome(expectedOutcome);
        const logger = new LoggerStub();
        const context = new TestContext()
          .withCommandRunner(commandRunner)
          .withLogger(logger);
        // act
        const actualOutcome = await context.executeScriptFile();
        // assert
        expect(actualOutcome).to.equal(expectedOutcome);
      });
    });

    describe('command running', () => {
      it('runs command once', async () => {
        // arrange
        const commandRunner = new CommandDefinitionRunnerStub();
        const context = new TestContext()
          .withCommandRunner(commandRunner);
        // act
        await context.executeScriptFile();
        // assert
        const calls = commandRunner.callHistory.filter((c) => c.methodName === 'runCommandDefinition');
        expect(calls).to.have.lengthOf(1);
      });

      it('runs correct definition', async () => {
        // arrange
        const expectedDefinition = new CommandDefinitionStub();
        const commandFactory = new CommandDefinitionFactoryStub()
          .withDefinition(expectedDefinition);
        const commandRunner = new CommandDefinitionRunnerStub();
        const context = new TestContext()
          .withCommandRunner(commandRunner)
          .withCommandFactory(commandFactory);
        // act
        await context.executeScriptFile();
        // assert
        const call = commandRunner.callHistory.find((c) => c.methodName === 'runCommandDefinition');
        expectExists(call);
        const [actualDefinition] = call.args;
        expect(actualDefinition).to.equal(expectedDefinition);
      });

      it('runs correct file', async () => {
        // arrange
        const expectedFilePath = '/expected/file/path';
        const commandRunner = new CommandDefinitionRunnerStub();
        const context = new TestContext()
          .withCommandRunner(commandRunner)
          .withFilePath(expectedFilePath);
        // act
        await context.executeScriptFile();
        // assert
        const call = commandRunner.callHistory.find((c) => c.methodName === 'runCommandDefinition');
        expectExists(call);
        const [,actualFilePath] = call.args;
        expect(actualFilePath).to.equal(expectedFilePath);
      });
    });
  });
});

class TestContext {
  private logger: Logger = new LoggerStub();

  public filePath = '/test/file/path';

  public commandFactory: CommandDefinitionFactory = new CommandDefinitionFactoryStub();

  public commandRunner: CommandDefinitionRunner = new CommandDefinitionRunnerStub();

  public withLogger(logger: Logger): this {
    this.logger = logger;
    return this;
  }

  public withFilePath(filePath: string): this {
    this.filePath = filePath;
    return this;
  }

  public withCommandRunner(commandRunner: CommandDefinitionRunner): this {
    this.commandRunner = commandRunner;
    return this;
  }

  public withCommandFactory(commandFactory: CommandDefinitionFactory): this {
    this.commandFactory = commandFactory;
    return this;
  }

  public executeScriptFile(): ReturnType<VisibleTerminalFileRunner['executeScriptFile']> {
    const runner = new VisibleTerminalFileRunner(
      this.logger,
      this.commandFactory,
      this.commandRunner,
    );
    return runner.executeScriptFile(
      this.filePath,
    );
  }
}
