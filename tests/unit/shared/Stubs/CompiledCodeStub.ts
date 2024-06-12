import type { CompiledCode } from '@/application/Parser/Executable/Script/Compiler/Function/Call/Compiler/CompiledCode';

export class CompiledCodeStub implements CompiledCode {
  public code = `${CompiledCodeStub.name}: code`;

  public revertCode?: string = `${CompiledCodeStub.name}: revertCode`;

  public withCode(code: string): this {
    this.code = code;
    return this;
  }

  public withRevertCode(revertCode?: string): this {
    this.revertCode = revertCode;
    return this;
  }
}
