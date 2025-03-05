import { InlinePowerShell } from './PipeDefinitions/InlinePowerShell';
import { EscapeDoubleQuotes } from './PipeDefinitions/EscapeDoubleQuotes';
import type { Pipe } from './Pipe';

const RegisteredPipes = [
  new EscapeDoubleQuotes(),
  new InlinePowerShell(),
];

export interface IPipeFactory {
  get(pipeName: string): Pipe;
}

export class PipeFactory implements IPipeFactory {
  private readonly pipes = new Map<string, Pipe>();

  constructor(pipes: readonly Pipe[] = RegisteredPipes) {
    for (const pipe of pipes) {
      this.registerPipe(pipe);
    }
  }

  public get(pipeName: string): Pipe {
    validatePipeName(pipeName);
    const pipe = this.pipes.get(pipeName);
    if (!pipe) {
      throw new Error(`Unknown pipe: "${pipeName}"`);
    }
    return pipe;
  }

  private registerPipe(pipe: Pipe): void {
    validatePipeName(pipe.name);
    if (this.pipes.has(pipe.name)) {
      throw new Error(`Pipe name must be unique: "${pipe.name}"`);
    }
    this.pipes.set(pipe.name, pipe);
  }
}

function validatePipeName(name: string) {
  if (!name) {
    throw new Error('empty pipe name');
  }
  if (!/^[a-z][A-Za-z]*$/.test(name)) {
    throw new Error(`Pipe name should be camelCase: "${name}"`);
  }
}
