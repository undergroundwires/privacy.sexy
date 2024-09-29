import type { Pipe } from '@/application/Parser/Executable/Script/Compiler/Expressions/Pipes/Pipe';
import type { IPipeFactory } from '@/application/Parser/Executable/Script/Compiler/Expressions/Pipes/PipeFactory';

export class PipeFactoryStub implements IPipeFactory {
  private readonly pipes = new Array<Pipe>();

  public get(pipeName: string): Pipe {
    const result = this.pipes.find((pipe) => pipe.name === pipeName);
    if (!result) {
      throw new Error(`pipe not registered: "${pipeName}"`);
    }
    return result;
  }

  public withPipe(pipe: Pipe) {
    this.pipes.push(pipe);
    return this;
  }

  public withPipes(pipes: Pipe[]) {
    for (const pipe of pipes) {
      this.withPipe(pipe);
    }
    return this;
  }
}
