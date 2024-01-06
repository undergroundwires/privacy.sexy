import { describe, it, expect } from 'vitest';
import { ScriptFileCodeRunner } from '@/infrastructure/CodeRunner/ScriptFileCodeRunner';
import { LoggerStub } from '@tests/unit/shared/Stubs/LoggerStub';
import { Logger } from '@/application/Common/Log/Logger';
import { ScriptFileExecutor } from '@/infrastructure/CodeRunner/Execution/ScriptFileExecutor';
import { ScriptFileExecutorStub } from '@tests/unit/shared/Stubs/ScriptFileExecutorStub';
import { ScriptFileCreator } from '@/infrastructure/CodeRunner/Creation/ScriptFileCreator';
import { ScriptFileCreatorStub } from '@tests/unit/shared/Stubs/ScriptFileCreatorStub';
import { expectExists } from '@tests/shared/Assertions/ExpectExists';
import { expectThrowsAsync } from '@tests/shared/Assertions/ExpectThrowsAsync';

describe('ScriptFileCodeRunner', () => {
  describe('runCode', () => {
    it('executes the script file as expected', async () => {
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
    it('creates script file with provided code', async () => {
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
    describe('error handling', () => {
      const testScenarios: ReadonlyArray<{
        readonly description: string;
        readonly injectedException: Error;
        readonly faultyContext: CodeRunnerTestSetup;
      }> = [
        (() => {
          const error = new Error('script file execution failed');
          const executor = new ScriptFileExecutorStub();
          executor.executeScriptFile = () => {
            throw error;
          };
          return {
            description: 'fails to execute script file',
            injectedException: error,
            faultyContext: new CodeRunnerTestSetup().withFileExecutor(executor),
          };
        })(),
        (() => {
          const error = new Error('script file creation failed');
          const creator = new ScriptFileCreatorStub();
          creator.createScriptFile = () => {
            throw error;
          };
          return {
            description: 'fails to create script file',
            injectedException: error,
            faultyContext: new CodeRunnerTestSetup().withFileCreator(creator),
          };
        })(),
      ];
      describe('logs errors correctly', () => {
        testScenarios.forEach(({ description, faultyContext }) => {
          it(`logs error when ${description}`, async () => {
            // arrange
            const logger = new LoggerStub();
            faultyContext.withLogger(logger);
            // act
            try {
              await faultyContext.runCode();
            } catch {
              // Swallow
            }
            // assert
            const errorCall = logger.callHistory.find((c) => c.methodName === 'error');
            expectExists(errorCall);
          });
        });
      });
      describe('correctly rethrows errors', () => {
        testScenarios.forEach(({ description, injectedException, faultyContext }) => {
          it(`rethrows error when ${description}`, async () => {
            // act
            const act = () => faultyContext.runCode();
            // assert
            await expectThrowsAsync(act, injectedException.message);
          });
        });
      });
    });
  });
});

class CodeRunnerTestSetup {
  private code = `[${CodeRunnerTestSetup.name}]code`;

  private fileCreator: ScriptFileCreator = new ScriptFileCreatorStub();

  private fileExecutor: ScriptFileExecutor = new ScriptFileExecutorStub();

  private logger: Logger = new LoggerStub();

  public async runCode(): Promise<void> {
    const runner = new ScriptFileCodeRunner(
      this.fileExecutor,
      this.fileCreator,
      this.logger,
    );
    await runner.runCode(this.code);
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
}
