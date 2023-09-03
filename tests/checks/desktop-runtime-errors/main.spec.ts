import {
  describe, it, beforeAll, afterAll,
} from 'vitest';
import { main } from './check-desktop-runtime-errors/main';
import { COMMAND_LINE_FLAGS, CommandLineFlag } from './check-desktop-runtime-errors/cli-args';

describe('desktop runtime error checks', () => {
  const { waitForExitCode } = useInterceptedProcessExitOrCompletion(beforeAll, afterAll);
  it('should successfully execute the main function and exit with a zero status code', async () => {
    // arrange
    setCommandLineFlagsFromEnvironmentVariables();
    // act
    const exitCode = await waitForExitCode(
      () => main(),
    );
    // assert
    expect(exitCode).to.equal(0);
  }, {
    timeout: 60 /* minutes */ * 60000,
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
      if (process.env[environmentVariableKey] !== undefined) {
        process.argv = [
          ...process.argv,
          COMMAND_LINE_FLAGS[flag],
        ];
      }
    });
}
