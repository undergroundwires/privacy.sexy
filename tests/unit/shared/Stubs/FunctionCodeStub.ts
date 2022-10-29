import { IFunctionCode } from '@/application/Parser/Script/Compiler/Function/ISharedFunction';

export class FunctionCodeStub implements IFunctionCode {
  public execute = 'execute code (function-code-stub)';

  public revert? = 'revert code (function-code-stub)';

  public withExecute(code: string) {
    this.execute = code;
    return this;
  }

  public withRevert(revert: string) {
    this.revert = revert;
    return this;
  }
}
