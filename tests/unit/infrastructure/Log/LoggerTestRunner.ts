import { it } from 'vitest';
import type { Logger } from '@/application/Common/Log/Logger';
import { getUnsafeTypedEntries } from '@/TypeHelpers';

export function itEachLoggingMethod(
  handler: (
    functionName: keyof Logger,
    testParameters: readonly unknown[]
  ) => void,
) {
  const testScenarios: {
    readonly [FunctionName in keyof Logger]: Parameters<Logger[FunctionName]>;
  } = {
    info: ['single-string'],
    warn: ['with number', 123],
    debug: ['with simple object', { some: 'object' }],
    error: ['with error object', new Error('error')],
  };

  getUnsafeTypedEntries(testScenarios)
    .forEach(([functionKey, testParameters]) => {
      it(functionKey, () => {
        handler(functionKey, testParameters);
      });
    });
}
