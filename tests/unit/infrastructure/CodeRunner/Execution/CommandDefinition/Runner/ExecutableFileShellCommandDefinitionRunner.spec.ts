import { describe, it, expect } from 'vitest';
import type { CommandDefinition } from '@/infrastructure/CodeRunner/Execution/CommandDefinition/CommandDefinition';
import { ExecutableFileShellCommandDefinitionRunner } from '@/infrastructure/CodeRunner/Execution/CommandDefinition/Runner/ExecutableFileShellCommandDefinitionRunner';
import type { ExecutablePermissionSetter } from '@/infrastructure/CodeRunner/Execution/CommandDefinition/Runner/PermissionSetter/ExecutablePermissionSetter';
import type { ShellCommandOutcome, ShellCommandRunner } from '@/infrastructure/CodeRunner/Execution/CommandDefinition/Runner/ShellRunner/ShellCommandRunner';
import { CommandDefinitionStub } from '@tests/unit/shared/Stubs/CommandDefinitionStub';
import { ExecutablePermissionSetterStub } from '@tests/unit/shared/Stubs/ExecutablePermissionSetterStub';
import { ShellCommandRunnerStub } from '@tests/unit/shared/Stubs/ShellCommandRunnerStub';
import type { ScriptFileExecutionOutcome } from '@/infrastructure/CodeRunner/Execution/ScriptFileExecutor';
import type { CodeRunErrorType } from '@/application/CodeRunner/CodeRunner';
import { expectExists } from '@tests/shared/Assertions/ExpectExists';

describe('ExecutableFileShellCommandDefinitionRunner', () => {
  describe('runCommandDefinition', () => {
    describe('handling file permissions', () => {
      describe('conditional permission settings', () => {
        it('sets permissions when required', async () => {
          // arrange
          const requireExecutablePermissions = true;
          const definition = new CommandDefinitionStub()
            .withExecutablePermissionsRequirement(requireExecutablePermissions);
          const permissionSetter = new ExecutablePermissionSetterStub();
          const context = new TestContext()
            .withCommandDefinition(definition)
            .withExecutablePermissionSetter(permissionSetter);
          // act
          await context.runCommandDefinition();
          // assert
          expect(permissionSetter.callHistory).to.have.lengthOf(1);
        });
        it('does not set permissions when not required', async () => {
          // arrange
          const requireExecutablePermissions = false;
          const definition = new CommandDefinitionStub()
            .withExecutablePermissionsRequirement(requireExecutablePermissions);
          const permissionSetter = new ExecutablePermissionSetterStub();
          const context = new TestContext()
            .withCommandDefinition(definition)
            .withExecutablePermissionSetter(permissionSetter);
          // act
          await context.runCommandDefinition();
          // assert
          expect(permissionSetter.callHistory).to.have.lengthOf(0);
        });
      });
      it('applies permissions to the correct file', async () => {
        // arrange
        const expectedFilePath = 'expected-file-path';
        const permissionSetter = new ExecutablePermissionSetterStub();
        const context = new TestContext()
          .withFilePath(expectedFilePath)
          .withCommandDefinition(createExecutableCommandDefinition())
          .withExecutablePermissionSetter(permissionSetter);

        // act
        await context.runCommandDefinition();

        // assert
        const calls = permissionSetter.callHistory.filter((call) => call.methodName === 'makeFileExecutable');
        expect(calls.length).to.equal(1);
        const [actualFilePath] = calls[0].args;
        expect(actualFilePath).to.equal(expectedFilePath);
      });
      it('executes command after setting permissions', async () => {
        // arrange
        const expectedFilePath = 'expected-file-path';
        let isExecutedOnExecutableFile = false;
        let isFileMadeExecutable = false;
        const permissionSetter = new ExecutablePermissionSetterStub();
        permissionSetter.methodCalls.on(() => {
          isFileMadeExecutable = true;
        });
        const commandRunner = new ShellCommandRunnerStub();
        commandRunner.methodCalls.on(() => {
          isExecutedOnExecutableFile = isFileMadeExecutable;
        });
        const context = new TestContext()
          .withFilePath(expectedFilePath)
          .withCommandDefinition(createExecutableCommandDefinition())
          .withCommandRunner(commandRunner)
          .withExecutablePermissionSetter(permissionSetter);

        // act
        await context.runCommandDefinition();

        // assert
        expect(isExecutedOnExecutableFile).to.equal(true);
      });
      it('returns an error if permission setting fails', async () => {
        // arrange
        const expectedOutcome: ScriptFileExecutionOutcome = {
          success: false,
          error: {
            type: 'FilePermissionChangeError',
            message: 'Expected error',
          },
        };
        const permissionSetter = new ExecutablePermissionSetterStub()
          .withOutcome(expectedOutcome);
        const context = new TestContext()
          .withCommandDefinition(createExecutableCommandDefinition())
          .withExecutablePermissionSetter(permissionSetter);

        // act
        const actualOutcome = await context.runCommandDefinition();

        // assert
        expect(expectedOutcome).to.equal(actualOutcome);
      });
    });
    describe('interpreting shell outcomes', () => {
      it('returns success for exit code 0', async () => {
        // arrange
        const expectedSuccessResult = true;
        const permissionSetter = new ShellCommandRunnerStub()
          .withOutcome({
            type: 'RegularProcessExit',
            exitCode: 0,
          });
        const context = new TestContext()
          .withCommandDefinition(createExecutableCommandDefinition())
          .withCommandRunner(permissionSetter);

        // act
        const outcome = await context.runCommandDefinition();

        // assert
        expect(outcome.success).to.equal(expectedSuccessResult);
      });
      describe('handling shell command failures', async () => {
        const testScenarios: readonly {
          readonly description: string;
          readonly shellOutcome: ShellCommandOutcome;
          readonly commandDefinition?: CommandDefinition;
          readonly expectedErrorType: CodeRunErrorType;
          readonly expectedErrorMessage: string;
        }[] = [
          {
            description: 'non-zero exit code without external termination',
            shellOutcome: {
              type: 'RegularProcessExit',
              exitCode: 20,
            },
            commandDefinition: new CommandDefinitionStub()
              .withExternalTerminationStatusForExitCode(20, false),
            expectedErrorType: 'FileExecutionError',
            expectedErrorMessage: 'Unexpected exit code: 20.',
          },
          {
            description: 'non-zero exit code with external termination',
            shellOutcome: {
              type: 'RegularProcessExit',
              exitCode: 5,
            },
            commandDefinition: new CommandDefinitionStub()
              .withExternalTerminationStatusForExitCode(5, true),
            expectedErrorType: 'ExternalProcessTermination',
            expectedErrorMessage: 'Process terminated externally: Exit code 5.',
          },
          {
            description: 'external termination',
            shellOutcome: {
              type: 'ExternallyTerminated',
              terminationSignal: 'SIGABRT',
            },
            expectedErrorType: 'ExternalProcessTermination',
            expectedErrorMessage: 'Process terminated by signal SIGABRT.',
          },
          {
            description: 'execution errors',
            shellOutcome: {
              type: 'ExecutionError',
              error: new Error('Expected message'),
            },
            expectedErrorType: 'FileExecutionError',
            expectedErrorMessage: 'Execution error: Expected message.',
          },
        ];
        testScenarios.forEach(({
          description, shellOutcome, expectedErrorType, expectedErrorMessage, commandDefinition,
        }) => {
          it(description, async () => {
            // arrange
            const permissionSetter = new ShellCommandRunnerStub()
              .withOutcome(shellOutcome);
            const context = new TestContext()
              .withCommandDefinition(commandDefinition ?? createExecutableCommandDefinition())
              .withCommandRunner(permissionSetter);

            // act
            const outcome = await context.runCommandDefinition();

            // assert
            expect(outcome.success).to.equal(false);
            expectExists(outcome.error);
            expect(outcome.error.message).to.contain(expectedErrorMessage);
            expect(outcome.error.type).to.equal(expectedErrorType);
          });
        });
      });
    });
  });
});

function createExecutableCommandDefinition(): CommandDefinition {
  return new CommandDefinitionStub()
    .withExecutablePermissionsRequirement(true);
}

class TestContext {
  private executablePermissionSetter
  : ExecutablePermissionSetter = new ExecutablePermissionSetterStub();

  private shellCommandRunner
  : ShellCommandRunner = new ShellCommandRunnerStub();

  private commandDefinition: CommandDefinition = new CommandDefinitionStub();

  private filePath: string = 'test-file-path';

  public withFilePath(filePath: string): this {
    this.filePath = filePath;
    return this;
  }

  public withCommandRunner(
    shellCommandRunner: ShellCommandRunner,
  ): this {
    this.shellCommandRunner = shellCommandRunner;
    return this;
  }

  public withCommandDefinition(
    commandDefinition: CommandDefinition,
  ): this {
    this.commandDefinition = commandDefinition;
    return this;
  }

  public withExecutablePermissionSetter(
    executablePermissionSetter: ExecutablePermissionSetter,
  ): this {
    this.executablePermissionSetter = executablePermissionSetter;
    return this;
  }

  public runCommandDefinition(): ReturnType<
  ExecutableFileShellCommandDefinitionRunner['runCommandDefinition']
  > {
    const sut = new ExecutableFileShellCommandDefinitionRunner(
      this.executablePermissionSetter,
      this.shellCommandRunner,
    );
    return sut.runCommandDefinition(
      this.commandDefinition,
      this.filePath,
    );
  }
}
