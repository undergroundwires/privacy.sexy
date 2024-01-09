import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { exec } from 'node:child_process';
import { describe, it } from 'vitest';
import { ScriptDirectoryProvider } from '@/infrastructure/CodeRunner/Creation/Directory/ScriptDirectoryProvider';
import { ScriptFileCreationOrchestrator } from '@/infrastructure/CodeRunner/Creation/ScriptFileCreationOrchestrator';
import { ScriptFileCodeRunner } from '@/infrastructure/CodeRunner/ScriptFileCodeRunner';
import { expectDoesNotThrowAsync } from '@tests/shared/Assertions/ExpectThrowsAsync';
import { CurrentEnvironment } from '@/infrastructure/RuntimeEnvironment/RuntimeEnvironmentFactory';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { LinuxTerminalEmulator } from '@/infrastructure/CodeRunner/Execution/VisibleTerminalScriptFileExecutor';

describe('ScriptFileCodeRunner', () => {
  it('executes simple script correctly', async ({ skip }) => {
    // arrange
    const currentOperatingSystem = CurrentEnvironment.os;
    if (await shouldSkipTest(currentOperatingSystem)) {
      skip();
    }
    const temporaryDirectoryProvider = createTemporaryDirectoryProvider();
    const codeRunner = createCodeRunner(temporaryDirectoryProvider);
    const args = getPlatformSpecificArguments(currentOperatingSystem);
    // act
    const act = () => codeRunner.runCode(...args);
    // assert
    await expectDoesNotThrowAsync(act);
  });
});

function getPlatformSpecificArguments(
  os: OperatingSystem | undefined,
): Parameters<ScriptFileCodeRunner['runCode']> {
  switch (os) {
    case undefined:
      throw new Error('Operating system detection failed: Unable to identify the current platform.');
    case OperatingSystem.Windows:
      return [
        [
          '@echo off',
          'echo Hello, World!',
          'exit /b 0',
        ].join('\n'),
        'bat',
      ];
    case OperatingSystem.macOS:
    case OperatingSystem.Linux:
      return [
        [
          '#!/bin/bash',
          'echo "Hello, World!"',
          'exit 0',
        ].join('\n'),
        'sh',
      ];
    default:
      throw new Error(`Platform not supported: The current operating system (${os}) is not compatible with this script execution.`);
  }
}

function shouldSkipTest(
  os: OperatingSystem | undefined,
): Promise<boolean> {
  return new Promise((resolve) => {
    if (os !== OperatingSystem.Linux) {
      resolve(false);
    }
    exec(`which ${LinuxTerminalEmulator}`).on('close', (exitCode) => {
      resolve(exitCode !== 0);
    });
  });
}

function createCodeRunner(directoryProvider: ScriptDirectoryProvider): ScriptFileCodeRunner {
  return new ScriptFileCodeRunner(
    undefined,
    new ScriptFileCreationOrchestrator(undefined, undefined, directoryProvider),
  );
}

function createTemporaryDirectoryProvider(): ScriptDirectoryProvider {
  return {
    provideScriptDirectory: async () => {
      const temporaryDirectoryPathPrefix = join(tmpdir(), 'privacy-sexy-tests-');
      const temporaryDirectoryFullPath = await mkdtemp(temporaryDirectoryPathPrefix);
      return temporaryDirectoryFullPath;
    },
  };
}