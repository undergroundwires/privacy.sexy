import type {
  ParameterDefinitionData, CodeFunctionData,
  FunctionCallsData, CallFunctionData,
} from '@/application/collections/';
import { FunctionCallDataStub } from './FunctionCallDataStub';

export function createFunctionDataWithCode(): FunctionDataStub {
  const instance = createFunctionDataWithoutCallOrCode()
    .withCode('stub-code')
    .withRevertCode('stub-revert-code');
  return instance;
}

export function createFunctionDataWithCall(
  call?: FunctionCallsData,
): FunctionDataStub {
  let instance = createFunctionDataWithoutCallOrCode();
  if (call) {
    instance = instance.withCall(call);
  } else {
    instance = instance.withMockCall();
  }
  return instance;
}

export function createFunctionDataWithoutCallOrCode(): FunctionDataStub {
  return new FunctionDataStub()
    .withCall(undefined)
    .withCode(undefined as unknown as string)
    .withRevertCode(undefined);
}

interface FunctionDataBuilder<T> {
  withName(name: string): T;
  withParameters(...parameters: readonly ParameterDefinitionData[]): T;
  withParametersObject(parameters: readonly ParameterDefinitionData[]): T;
}

interface CodeFunctionDataBuilder extends FunctionDataBuilder<CodeFunctionDataBuilder> {
  withCode(code: string): this;
  withRevertCode(revertCode: string): this;
}

interface CallFunctionDataBuilder extends FunctionDataBuilder<CallFunctionDataBuilder> {
  withCall(call: FunctionCallsData): this;
  withMockCall(): this;
}

class FunctionDataStub
implements CodeFunctionDataBuilder, CallFunctionDataBuilder, CallFunctionData, CodeFunctionData {
  public name = `[${FunctionDataStub.name}]name`;

  public code: string = `[${FunctionDataStub.name}]code`;

  public revertCode?: string;

  public call: FunctionCallsData;

  public parameters?: readonly ParameterDefinitionData[];

  public withName(name: string) {
    this.name = name;
    return this;
  }

  public withParameters(...parameters: readonly ParameterDefinitionData[]) {
    return this.withParametersObject(parameters);
  }

  public withParametersObject(parameters: readonly ParameterDefinitionData[]) {
    this.parameters = parameters;
    return this;
  }

  public withCode(code: string) {
    this.code = code;
    return this;
  }

  public withRevertCode(revertCode: string | undefined) {
    this.revertCode = revertCode;
    return this;
  }

  public withCall(call: FunctionCallsData) {
    this.call = call;
    return this;
  }

  public withMockCall() {
    this.call = new FunctionCallDataStub();
    return this;
  }
}
