import type { IPipe } from '@/application/Parser/Script/Compiler/Expressions/Pipes/IPipe';
import type { IPipeFactory } from '@/application/Parser/Script/Compiler/Expressions/Pipes/PipeFactory';

export class PipeFactoryStub implements IPipeFactory {
  private readonly pipes = new Array<IPipe>();

  public get(pipeName: string): IPipe {
    const result = this.pipes.find((pipe) => pipe.name === pipeName);
    if (!result) {
      throw new Error(`pipe not registered: "${pipeName}"`);
    }
    return result;
  }

  public withPipe(pipe: IPipe) {
    this.pipes.push(pipe);
    return this;
  }

  public withPipes(pipes: IPipe[]) {
    for (const pipe of pipes) {
      this.withPipe(pipe);
    }
    return this;
  }
}
