import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { exec } from 'node:child_process';
import { describe, it } from 'vitest';
import type { ScriptDirectoryProvider } from '@/infrastructure/CodeRunner/Creation/Directory/ScriptDirectoryProvider';
import { ScriptFileCreationOrchestrator } from '@/infrastructure/CodeRunner/Creation/ScriptFileCreationOrchestrator';
import { ScriptFileCodeRunner } from '@/infrastructure/CodeRunner/ScriptFileCodeRunner';
import { CurrentEnvironment } from '@/infrastructure/RuntimeEnvironment/RuntimeEnvironmentFactory';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { LinuxTerminalEmulator } from '@/infrastructure/CodeRunner/Execution/VisibleTerminalScriptFileExecutor';
import { formatAssertionMessage } from '@tests/shared/FormatAssertionMessage';

describe('ScriptFileCodeRunner', () => {
  it('executes simple script correctly', async ({ skip }) => {
    // arrange
    const currentOperatingSystem = CurrentEnvironment.os;
    if (await shouldSkipTest(currentOperatingSystem)) {
      skip();
      return;
    }
    const temporaryDirectoryProvider = createTemporaryDirectoryProvider();
    const codeRunner = createCodeRunner(temporaryDirectoryProvider);
    const args = getPlatformSpecificArguments(currentOperatingSystem);
    // act
    const { success, error } = await codeRunner.runCode(...args);
    // assert
    expect(success).to.equal(true, formatAssertionMessage([
      'Failed to successfully execute the script.',
      'Details:', JSON.stringify(error),
    ]));
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
  if (os !== OperatingSystem.Linux) {
    return Promise.resolve(false);
  }
  return isLinuxTerminalEmulatorSupported();
}

function isLinuxTerminalEmulatorSupported(): Promise<boolean> {
  return new Promise((resolve) => {
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
      return {
        success: true,
        directoryAbsolutePath: temporaryDirectoryFullPath,
      };
    },
  };
}
