import type { FunctionCallData, FunctionCallsData, FunctionCallParametersData } from '@/application/collections/';
import { isArray, isPlainObject } from '@/TypeHelpers';
import { createTypeValidator, type TypeValidator } from '@/application/Parser/Common/TypeValidator';
import { FunctionCallArgumentCollection } from './Argument/FunctionCallArgumentCollection';
import { FunctionCallArgument } from './Argument/FunctionCallArgument';
import { ParsedFunctionCall } from './ParsedFunctionCall';
import type { FunctionCall } from './FunctionCall';

export interface FunctionCallsParser {
  (
    calls: FunctionCallsData,
    validator?: TypeValidator,
  ): FunctionCall[];
}

export const parseFunctionCalls: FunctionCallsParser = (
  calls,
  validator = createTypeValidator(),
) => {
  const sequence = getCallSequence(calls, validator);
  return sequence.map((call) => parseFunctionCall(call, validator));
};

function getCallSequence(calls: FunctionCallsData, validator: TypeValidator): FunctionCallData[] {
  if (!isPlainObject(calls) && !isArray(calls)) {
    throw new Error('called function(s) must be an object or array');
  }
  if (isArray(calls)) {
    validator.assertNonEmptyCollection({
      value: calls,
      valueName: 'function call sequence',
    });
    return calls as FunctionCallData[];
  }
  const singleCall = calls as FunctionCallData;
  return [singleCall];
}

function parseFunctionCall(
  call: FunctionCallData,
  validator: TypeValidator,
): FunctionCall {
  validator.assertObject({
    value: call,
    valueName: 'function call',
    allowedProperties: ['function', 'parameters'],
  });
  const callArgs = parseArgs(call.parameters);
  return new ParsedFunctionCall(call.function, callArgs);
}

function parseArgs(
  parameters: FunctionCallParametersData | undefined,
): FunctionCallArgumentCollection {
  const parametersMap = parameters ?? {};
  return Object.keys(parametersMap)
    .map((parameterName) => new FunctionCallArgument(parameterName, parametersMap[parameterName]))
    .reduce((args, arg) => {
      args.addArgument(arg);
      return args;
    }, new FunctionCallArgumentCollection());
}
