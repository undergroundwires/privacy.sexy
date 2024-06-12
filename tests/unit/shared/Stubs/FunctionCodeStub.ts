import type { IFunctionCode } from '@/application/Parser/Executable/Script/Compiler/Function/ISharedFunction';

export class FunctionCodeStub implements IFunctionCode {
  public execute = 'execute code (function-code-stub)';

  public revert: string | undefined = 'revert code (function-code-stub)';

  public withExecute(code: string) {
    this.execute = code;
    return this;
  }

  public withRevert(revert: string | undefined) {
    this.revert = revert;
    return this;
  }
}
