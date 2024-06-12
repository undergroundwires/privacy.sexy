import type { IPipe } from '@/application/Parser/Executable/Script/Compiler/Expressions/Pipes/IPipe';

export class PipeStub implements IPipe {
  public name = 'pipeStub';

  public apply(raw: string): string {
    return raw;
  }

  public withName(name: string): PipeStub {
    this.name = name;
    return this;
  }

  public withApplier(applier: (input: string) => string): PipeStub {
    this.apply = applier;
    return this;
  }
}
