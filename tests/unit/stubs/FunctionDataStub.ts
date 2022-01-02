import { FunctionData, ParameterDefinitionData, FunctionCallsData } from 'js-yaml-loader!@/*';
import { FunctionCallDataStub } from './FunctionCallDataStub';

export class FunctionDataStub implements FunctionData {
  public static createWithCode() {
    return new FunctionDataStub()
      .withCode('stub-code')
      .withRevertCode('stub-revert-code');
  }

  public static createWithCall(call?: FunctionCallsData) {
    let instance = new FunctionDataStub();
    if (call) {
      instance = instance.withCall(call);
    } else {
      instance = instance.withMockCall();
    }
    return instance;
  }

  public static createWithoutCallOrCodes() {
    return new FunctionDataStub();
  }

  public name = 'functionDataStub';

  public code: string;

  public revertCode: string;

  public call?: FunctionCallsData;

  public parameters?: readonly ParameterDefinitionData[];

  private constructor() { /* use static factory methods to create an instance */ }

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

  public withRevertCode(revertCode: string) {
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
