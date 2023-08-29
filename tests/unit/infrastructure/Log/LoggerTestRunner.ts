import { it } from 'vitest';
import { FunctionKeys } from '@/TypeHelpers';
import { ILogger } from '@/infrastructure/Log/ILogger';

export function itEachLoggingMethod(
  handler: (
    functionName: keyof ILogger,
    testParameters?: unknown[]
  ) => void,
) {
  const testParameters = ['test', 123, { some: 'object' }];
  const loggerMethods: Array<FunctionKeys<ILogger>> = [
    'info',
  ];
  loggerMethods
    .forEach((functionKey) => {
      it(functionKey, () => {
        handler(functionKey, testParameters);
      });
    });
}
