import { FunctionCallData, FunctionCallsData, FunctionCallParametersData } from 'js-yaml-loader!@/*';
import { IFunctionCall } from './IFunctionCall';
import { FunctionCallArgumentCollection } from './Argument/FunctionCallArgumentCollection';
import { FunctionCallArgument } from './Argument/FunctionCallArgument';
import { FunctionCall } from './FunctionCall';

export function parseFunctionCalls(calls: FunctionCallsData): IFunctionCall[] {
  if (calls === undefined) {
    throw new Error('missing call data');
  }
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
  return [calls as FunctionCallData];
}

function parseFunctionCall(call: FunctionCallData): IFunctionCall {
  if (!call) {
    throw new Error('missing call data');
  }
  const callArgs = parseArgs(call.parameters);
  return new FunctionCall(call.function, callArgs);
}

function parseArgs(
  parameters: FunctionCallParametersData,
): FunctionCallArgumentCollection {
  return Object.keys(parameters || {})
    .map((parameterName) => new FunctionCallArgument(parameterName, parameters[parameterName]))
    .reduce((args, arg) => {
      args.addArgument(arg);
      return args;
    }, new FunctionCallArgumentCollection());
}
