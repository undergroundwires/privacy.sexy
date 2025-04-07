import {
  describe, it, beforeAll, afterAll,
} from 'vitest';
import { formatAssertionMessage } from '@tests/shared/FormatAssertionMessage';
import { main } from './check-desktop-runtime-errors/main';
import { COMMAND_LINE_FLAGS, CommandLineFlag } from './check-desktop-runtime-errors/cli-args';
import { APP_EXECUTION_DURATION_IN_SECONDS } from './check-desktop-runtime-errors/config';

describe('desktop runtime error checks', () => {
  const { waitForExitCode } = useInterceptedProcessExitOrCompletion(beforeAll, afterAll);
  it('should successfully execute the main function and exit with a zero status code', {
    timeout: APP_EXECUTION_DURATION_IN_SECONDS + 30 /* minutes */ * 60000,
  }, async () => {
    // arrange
    setCommandLineFlagsFromEnvironmentVariables();
    // act
    const exitCode = await waitForExitCode(
      () => main(),
    );
    // assert
    expect(exitCode).to.equal(0, formatAssertionMessage([
      `Test failed with exit code ${exitCode}; expected 0.`,
      'Examine preceding logs to identify errors.',
    ]));
  });
});

function useInterceptedProcessExitOrCompletion(
  beforeTest: (callback: () => void) => void,
  afterTest: (callback: () => void) => void,
) {
  const originalFunction = global.process.exit;
  let isExitCodeReceived = false;
  let exitCodeResolver: (value: number | undefined) => void;
  const waitForExitCode = (runner: () => Promise<void>) => new Promise<number | undefined>(
    (resolve, reject) => {
      exitCodeResolver = resolve;
      runner()
        .catch((error) => {
          if (isExitCodeReceived) {
            return;
          }
          console.error('Process did not call `process.exit` but threw an error:', error);
          reject(error);
        })
        .then(() => {
          if (isExitCodeReceived) {
            return;
          }
          console.log('Process completed without calling `process.exit`. Treating as `0` exit code.');
          exitCodeResolver(0);
        });
    },
  );
  beforeTest(() => {
    global.process.exit = (code?: number): never => {
      exitCodeResolver(code);
      isExitCodeReceived = true;
      return undefined as never;
    };
  });
  afterTest(() => {
    global.process.exit = originalFunction;
  });
  return {
    waitForExitCode,
  };
}

/*
  Map environment variables to CLI arguments for compatibility with Vitest.
*/
function setCommandLineFlagsFromEnvironmentVariables() {
  const flagEnvironmentVariableKeyMappings: {
    readonly [key in CommandLineFlag]: string;
  } = {
    [CommandLineFlag.ForceRebuild]: 'BUILD',
    [CommandLineFlag.TakeScreenshot]: 'SCREENSHOT',
  };
  Object.entries(flagEnvironmentVariableKeyMappings)
    .forEach(([flag, environmentVariableKey]) => {
      const flagValue = Number.parseInt(flag, 10) as CommandLineFlag;
      const flagDefinition = COMMAND_LINE_FLAGS[flagValue];
      if (process.env[environmentVariableKey] !== undefined) {
        process.argv = [
          ...process.argv,
          flagDefinition,
        ];
      }
    });
}
