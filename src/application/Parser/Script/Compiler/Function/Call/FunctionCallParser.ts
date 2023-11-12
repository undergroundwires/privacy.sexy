import type { FunctionCallData, FunctionCallsData, FunctionCallParametersData } from '@/application/collections/';
import { FunctionCall } from './FunctionCall';
import { FunctionCallArgumentCollection } from './Argument/FunctionCallArgumentCollection';
import { FunctionCallArgument } from './Argument/FunctionCallArgument';
import { ParsedFunctionCall } from './ParsedFunctionCall';

export function parseFunctionCalls(calls: FunctionCallsData): FunctionCall[] {
  const sequence = getCallSequence(calls);
  return sequence.map((call) => parseFunctionCall(call));
}

function getCallSequence(calls: FunctionCallsData): FunctionCallData[] {
  if (typeof calls !== 'object') {
    throw new Error('called function(s) must be an object');
  }
  if (calls instanceof Array) {
    return calls as FunctionCallData[];
  }
  const singleCall = calls;
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
