import {
  ISharedFunction, FunctionBodyType, CallFunctionBody, CodeFunctionBody,
} from '@/application/Parser/Script/Compiler/Function/ISharedFunction';
import { IReadOnlyFunctionParameterCollection } from '@/application/Parser/Script/Compiler/Function/Parameter/IFunctionParameterCollection';
import { FunctionCall } from '@/application/Parser/Script/Compiler/Function/Call/FunctionCall';
import { FunctionParameterCollectionStub } from './FunctionParameterCollectionStub';
import { FunctionCallStub } from './FunctionCallStub';
import { FunctionCodeStub } from './FunctionCodeStub';

type CodeOrCallBody<T extends FunctionBodyType> = T extends FunctionBodyType.Calls
  ? CallFunctionBody : CodeFunctionBody;

export function createSharedFunctionStubWithCalls(): SharedFunctionStub<FunctionBodyType.Calls> {
  return new SharedFunctionStub(FunctionBodyType.Calls);
}

export function createSharedFunctionStubWithCode(): SharedFunctionStub<FunctionBodyType.Code> {
  return new SharedFunctionStub(FunctionBodyType.Code);
}

class SharedFunctionStub<T extends FunctionBodyType>
implements ISharedFunction {
  public name = `${SharedFunctionStub.name}-name`;

  public parameters: IReadOnlyFunctionParameterCollection = new FunctionParameterCollectionStub()
    .withParameterName(`${SharedFunctionStub.name}-parameter-name`);

  private code = `${SharedFunctionStub.name}-code`;

  private revertCode: string | undefined = `${SharedFunctionStub.name}-revert-code`;

  private readonly bodyType: FunctionBodyType = FunctionBodyType.Code;

  private calls: FunctionCall[] = [new FunctionCallStub()];

  constructor(type: T) {
    this.bodyType = type;
  }

  public get body(): CodeOrCallBody<T> {
    switch (this.bodyType) {
      case FunctionBodyType.Code:
        return this.getCodeBody() as CodeOrCallBody<T>;
      case FunctionBodyType.Calls:
        return this.getCallBody() as CodeOrCallBody<T>;
      default:
        throw new Error(`unknown body type: ${this.bodyType}`);
    }
  }

  public withName(name: string): this {
    this.name = name;
    return this;
  }

  public withCode(code: string): this {
    this.code = code;
    return this;
  }

  public withRevertCode(revertCode: string | undefined): this {
    this.revertCode = revertCode;
    return this;
  }

  public withParameters(parameters: IReadOnlyFunctionParameterCollection): this {
    this.parameters = parameters;
    return this;
  }

  public withSomeCalls(): this {
    return this.withCalls(new FunctionCallStub(), new FunctionCallStub());
  }

  public withCalls(...calls: readonly FunctionCall[]): this {
    this.calls = [...calls];
    return this;
  }

  public withParameterNames(...parameterNames: readonly string[]): this {
    let collection = new FunctionParameterCollectionStub();
    for (const name of parameterNames) {
      collection = collection.withParameterName(name);
    }
    return this.withParameters(collection);
  }

  private getCodeBody(): CodeFunctionBody {
    return {
      type: FunctionBodyType.Code,
      code: new FunctionCodeStub()
        .withExecute(this.code)
        .withRevert(this.revertCode),
    };
  }

  private getCallBody(): CallFunctionBody {
    return {
      type: FunctionBodyType.Calls,
      calls: this.calls,
    };
  }
}
