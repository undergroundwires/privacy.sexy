import type { FunctionCallData, FunctionCallsData, FunctionCallParametersData } from '@/application/collections/';
import { isArray, isPlainObject } from '@/TypeHelpers';
import { FunctionCallArgumentCollection } from './Argument/FunctionCallArgumentCollection';
import { FunctionCallArgument } from './Argument/FunctionCallArgument';
import { ParsedFunctionCall } from './ParsedFunctionCall';
import type { FunctionCall } from './FunctionCall';

export function parseFunctionCalls(calls: FunctionCallsData): FunctionCall[] {
  const sequence = getCallSequence(calls);
  return sequence.map((call) => parseFunctionCall(call));
}

function getCallSequence(calls: FunctionCallsData): FunctionCallData[] {
  if (!isPlainObject(calls) && !isArray(calls)) {
    throw new Error('called function(s) must be an object or array');
  }
  if (isArray(calls)) {
    return calls as FunctionCallData[];
  }
  const singleCall = calls as FunctionCallData;
  return [singleCall];
}

function parseFunctionCall(call: FunctionCallData): FunctionCall {
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
