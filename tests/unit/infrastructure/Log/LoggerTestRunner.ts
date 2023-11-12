import { it } from 'vitest';
import { FunctionKeys } from '@/TypeHelpers';
import { ILogger } from '@/infrastructure/Log/ILogger';

type TestParameters = [string, number, { some: string }];

export function itEachLoggingMethod(
  handler: (
    functionName: keyof ILogger,
    testParameters: TestParameters,
  ) => void,
) {
  const testParameters: TestParameters = ['test', 123, { some: 'object' }];
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
