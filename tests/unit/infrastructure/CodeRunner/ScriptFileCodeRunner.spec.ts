import { describe, it, expect } from 'vitest';
import { ScriptFileCodeRunner } from '@/infrastructure/CodeRunner/ScriptFileCodeRunner';
import { LoggerStub } from '@tests/unit/shared/Stubs/LoggerStub';
import { Logger } from '@/application/Common/Log/Logger';
import { ScriptFilename } from '@/application/CodeRunner/ScriptFilename';
import { ScriptFileExecutor } from '@/infrastructure/CodeRunner/Execution/ScriptFileExecutor';
import { ScriptFileExecutorStub } from '@tests/unit/shared/Stubs/ScriptFileExecutorStub';
import { ScriptFileCreator } from '@/infrastructure/CodeRunner/Creation/ScriptFileCreator';
import { ScriptFileCreatorStub } from '@tests/unit/shared/Stubs/ScriptFileCreatorStub';
import { expectExists } from '@tests/shared/Assertions/ExpectExists';
import { CodeRunErrorType } from '@/application/CodeRunner/CodeRunner';

describe('ScriptFileCodeRunner', () => {
  describe('runCode', () => {
    describe('creating file', () => {
      it('uses provided code', async () => {
        // arrange
        const expectedCode = 'expected code';
        const fileCreator = new ScriptFileCreatorStub();
        const context = new CodeRunnerTestSetup()
          .withFileCreator(fileCreator)
          .withCode(expectedCode);

        // act
        await context.runCode();

        // assert
        const createCalls = fileCreator.callHistory.filter((call) => call.methodName === 'createScriptFile');
        expect(createCalls.length).to.equal(1);
        const [actualCode] = createCalls[0].args;
        expect(actualCode).to.equal(expectedCode);
      });
      it('uses provided extension', async () => {
        // arrange
        const expectedFileExtension = 'expected-file-extension';
        const fileCreator = new ScriptFileCreatorStub();
        const context = new CodeRunnerTestSetup()
          .withFileCreator(fileCreator)
          .withFileExtension(expectedFileExtension);

        // act
        await context.runCode();

        // assert
        const createCalls = fileCreator.callHistory.filter((call) => call.methodName === 'createScriptFile');
        expect(createCalls.length).to.equal(1);
        const [,scriptFileNameParts] = createCalls[0].args;
        expectExists(scriptFileNameParts, JSON.stringify(`Call args: ${JSON.stringify(createCalls[0].args)}`));
        expect(scriptFileNameParts.scriptFileExtension).to.equal(expectedFileExtension);
      });
      it('uses default script name', async () => {
        // arrange
        const expectedScriptName = ScriptFilename;
        const fileCreator = new ScriptFileCreatorStub();
        const context = new CodeRunnerTestSetup()
          .withFileCreator(fileCreator);

        // act
        await context.runCode();

        // assert
        const createCalls = fileCreator.callHistory.filter((call) => call.methodName === 'createScriptFile');
        expect(createCalls.length).to.equal(1);
        const [,scriptFileNameParts] = createCalls[0].args;
        expectExists(scriptFileNameParts, JSON.stringify(`Call args: ${JSON.stringify(createCalls[0].args)}`));
        expect(scriptFileNameParts.scriptName).to.equal(expectedScriptName);
      });
    });
    describe('executing file', () => {
      it('executes at correct path', async () => {
        // arrange
        const expectedFilePath = 'expected script path';
        const fileExecutor = new ScriptFileExecutorStub();
        const context = new CodeRunnerTestSetup()
          .withFileCreator(new ScriptFileCreatorStub().withCreatedFilePath(expectedFilePath))
          .withFileExecutor(fileExecutor);

        // act
        await context.runCode();

        // assert
        const executeCalls = fileExecutor.callHistory.filter((call) => call.methodName === 'executeScriptFile');
        expect(executeCalls.length).to.equal(1);
        const [actualPath] = executeCalls[0].args;
        expect(actualPath).to.equal(expectedFilePath);
      });
    });
    describe('successful run', () => {
      it('indicates success', async () => {
        // arrange
        const expectedSuccessResult = true;
        const context = new CodeRunnerTestSetup();

        // act
        const { success: actualSuccessValue } = await context.runCode();

        // assert
        expect(actualSuccessValue).to.equal(expectedSuccessResult);
      });
      it('logs success message', async () => {
        // arrange
        const expectedMessagePart = 'Successfully ran script';
        const logger = new LoggerStub();
        const context = new CodeRunnerTestSetup()
          .withLogger(logger);

        // act
        await context.runCode();

        // assert
        logger.assertLogsContainMessagePart('info', expectedMessagePart);
      });
    });
    describe('error handling', () => {
      const testScenarios: ReadonlyArray<{
        readonly description: string;
        readonly expectedErrorType: CodeRunErrorType;
        readonly expectedErrorMessage: string;
        buildFaultyContext(
          setup: CodeRunnerTestSetup,
          errorMessage: string,
          errorType: CodeRunErrorType,
        ): CodeRunnerTestSetup;
      }> = [
        {
          description: 'execution failure',
          expectedErrorType: 'FileExecutionError',
          expectedErrorMessage: 'execution error',
          buildFaultyContext: (setup, errorMessage, errorType) => {
            const executor = new ScriptFileExecutorStub();
            executor.executeScriptFile = () => Promise.resolve({
              success: false,
              error: {
                message: errorMessage,
                type: errorType,
              },
            });
            return setup.withFileExecutor(executor);
          },
        },
        {
          description: 'creation failure',
          expectedErrorType: 'FileWriteError',
          expectedErrorMessage: 'creation error',
          buildFaultyContext: (setup, errorMessage, errorType) => {
            const creator = new ScriptFileCreatorStub();
            creator.createScriptFile = () => Promise.resolve({
              success: false,
              error: {
                message: errorMessage,
                type: errorType,
              },
            });
            return setup.withFileCreator(creator);
          },
        },
      ];
      testScenarios.forEach(({
        description, expectedErrorType, expectedErrorMessage, buildFaultyContext,
      }) => {
        it(`handles ${description}`, async () => {
          // arrange
          const context = buildFaultyContext(
            new CodeRunnerTestSetup(),
            expectedErrorMessage,
            expectedErrorType,
          );

          // act
          const { success, error } = await context.runCode();

          // assert
          expect(success).to.equal(false);
          expectExists(error);
          expect(error.message).to.include(expectedErrorMessage);
          expect(error.type).to.equal(expectedErrorType);
        });
      });
    });
  });
});

class CodeRunnerTestSetup {
  private code = `[${CodeRunnerTestSetup.name}]code`;

  private fileExtension = `[${CodeRunnerTestSetup.name}]file-extension`;

  private fileCreator: ScriptFileCreator = new ScriptFileCreatorStub();

  private fileExecutor: ScriptFileExecutor = new ScriptFileExecutorStub();

  private logger: Logger = new LoggerStub();

  public runCode() {
    const runner = new ScriptFileCodeRunner(
      this.fileExecutor,
      this.fileCreator,
      this.logger,
    );
    return runner
      .runCode(this.code, this.fileExtension);
  }

  public withFileExecutor(fileExecutor: ScriptFileExecutor): this {
    this.fileExecutor = fileExecutor;
    return this;
  }

  public withCode(code: string): this {
    this.code = code;
    return this;
  }

  public withLogger(logger: Logger): this {
    this.logger = logger;
    return this;
  }

  public withFileCreator(fileCreator: ScriptFileCreator): this {
    this.fileCreator = fileCreator;
    return this;
  }

  public withFileExtension(fileExtension: string): this {
    this.fileExtension = fileExtension;
    return this;
  }
}
