import type {
  FunctionCallData,
  FunctionCallsData,
  FunctionCallParametersData,
} from '@/application/collections/';
import { isArray, isPlainObject } from '@/TypeHelpers';
import { createTypeValidator, type TypeValidator } from '@/application/Parser/Common/TypeValidator';
import { FunctionCallArgumentCollection } from './Argument/FunctionCallArgumentCollection';
import { ParsedFunctionCall } from './ParsedFunctionCall';
import { createFunctionCallArgument, type FunctionCallArgumentFactory } from './Argument/FunctionCallArgument';
import type { FunctionCall } from './FunctionCall';

export interface FunctionCallsParser {
  (
    calls: FunctionCallsData,
    utilities?: FunctionCallParsingUtilities,
  ): FunctionCall[];
}

interface FunctionCallParsingUtilities {
  readonly typeValidator: TypeValidator;
  readonly createCallArgument: FunctionCallArgumentFactory;
}

const DefaultUtilities: FunctionCallParsingUtilities = {
  typeValidator: createTypeValidator(),
  createCallArgument: createFunctionCallArgument,
};

export const parseFunctionCalls: FunctionCallsParser = (
  calls,
  utilities = DefaultUtilities,
) => {
  const sequence = getCallSequence(calls, utilities.typeValidator);
  return sequence.map((call) => parseFunctionCall(call, utilities));
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
  utilities: FunctionCallParsingUtilities,
): FunctionCall {
  utilities.typeValidator.assertObject({
    value: call,
    valueName: 'function call',
    allowedProperties: ['function', 'parameters'],
  });
  const callArgs = parseArgs(call.parameters, utilities.createCallArgument);
  return new ParsedFunctionCall(call.function, callArgs);
}

function parseArgs(
  parameters: FunctionCallParametersData | undefined,
  createArgument: FunctionCallArgumentFactory,
): FunctionCallArgumentCollection {
  const parametersMap = parameters ?? {};
  return Object.keys(parametersMap)
    .map((parameterName) => {
      const argumentValue = parametersMap[parameterName];
      return createArgument(parameterName, argumentValue);
    })
    .reduce((args, arg) => {
      args.addArgument(arg);
      return args;
    }, new FunctionCallArgumentCollection());
}
