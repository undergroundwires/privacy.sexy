import { IPipeFactory, PipeFactory } from './PipeFactory';
import { IPipelineCompiler } from './IPipelineCompiler';

export class PipelineCompiler implements IPipelineCompiler {
    constructor(private readonly factory: IPipeFactory = new PipeFactory()) { }
    public compile(value: string, pipeline: string): string {
        ensureValidArguments(value, pipeline);
        const pipeNames = extractPipeNames(pipeline);
        const pipes = pipeNames.map((pipeName) => this.factory.get(pipeName));
        for (const pipe of pipes) {
            value = pipe.apply(value);
        }
        return value;
    }
}

function extractPipeNames(pipeline: string): string[] {
    return pipeline
        .trim()
        .split('|')
        .slice(1)
        .map((p) => p.trim());
}

function ensureValidArguments(value: string, pipeline: string) {
    if (!value) { throw new Error('undefined value'); }
    if (!pipeline) { throw new Error('undefined pipeline'); }
    if (!pipeline.trimStart().startsWith('|')) {
        throw new Error('pipeline does not start with pipe');
    }
}
