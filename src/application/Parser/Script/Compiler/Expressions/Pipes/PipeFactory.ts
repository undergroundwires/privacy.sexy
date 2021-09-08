import { IPipe } from './IPipe';

const RegisteredPipes = [ ];

export interface IPipeFactory {
    get(pipeName: string): IPipe;
}

export class PipeFactory implements IPipeFactory {
    private readonly pipes = new Map<string, IPipe>();
    constructor(pipes: readonly IPipe[] = RegisteredPipes) {
        if (pipes.some((pipe) => !pipe)) {
            throw new Error('undefined pipe in list');
        }
        for (const pipe of pipes) {
            this.registerPipe(pipe);
        }
    }
    public get(pipeName: string): IPipe {
        validatePipeName(pipeName);
        if (!this.pipes.has(pipeName)) {
            throw new Error(`Unknown pipe: "${pipeName}"`);
        }
        return this.pipes.get(pipeName);
    }
    private registerPipe(pipe: IPipe): void {
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
