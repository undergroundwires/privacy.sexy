import type { FunctionCall } from '@/application/Application/Loader/Collections/Compiler/Executable/Script/Compiler/Function/Call/FunctionCall';
import type { FunctionCallsParser } from '@/application/Application/Loader/Collections/Compiler/Executable/Script/Compiler/Function/Call/FunctionCallsParser';
import type { FunctionCallsData } from '@/application/collections/';
import { FunctionCallStub } from './FunctionCallStub';

export function createFunctionCallsParserStub() {
  const setupResults = new Map<FunctionCallsData, FunctionCall[]>();
  const parser: FunctionCallsParser = (rawData) => {
    if (setupResults.size === 0) {
      return [
        new FunctionCallStub().withFunctionName('function created by parser stub'),
      ];
    }
    const setupResult = setupResults.get(rawData);
    if (setupResult === undefined) {
      throw new Error(`Stub error: Expected pre-configured input data was not found.\n
        Received input: ${JSON.stringify(rawData, null, 2)}\n
        Number of configurations available: ${setupResults.size}\n
        Available configurations: ${JSON.stringify([...setupResults.keys()].map((key) => JSON.stringify(key, null, 2)), null, 2)}`);
    }
    return setupResult;
  };
  const setup = (rawData: FunctionCallsData, parsedData: FunctionCall[]) => {
    setupResults.set(rawData, parsedData);
  };
  return {
    parser,
    setup,
  };
}
