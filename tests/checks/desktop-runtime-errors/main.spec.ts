import { test } from 'vitest';
import { main } from './check-desktop-runtime-errors/main';
import { COMMAND_LINE_FLAGS, CommandLineFlag } from './check-desktop-runtime-errors/cli-args';

test('should have no desktop runtime errors', async () => {
  // arrange
  setCommandLineFlagsFromEnvironmentVariables();
  let exitCode: number;
  global.process.exit = (code?: number): never => {
    exitCode = code;
    return undefined as never;
  };
  // act
  await main();
  // assert
  expect(exitCode).to.equal(0);
}, {
  timeout: 60 /* minutes */ * 10000,
});

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
