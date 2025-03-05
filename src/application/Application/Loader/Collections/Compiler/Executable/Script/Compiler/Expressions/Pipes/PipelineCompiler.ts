import { type IPipeFactory, PipeFactory } from './PipeFactory';
import type { IPipelineCompiler } from './IPipelineCompiler';

export class PipelineCompiler implements IPipelineCompiler {
  constructor(private readonly factory: IPipeFactory = new PipeFactory()) { }

  public compile(value: string, pipeline: string): string {
    ensureValidArguments(value, pipeline);
    const pipeNames = extractPipeNames(pipeline);
    const pipes = pipeNames.map((pipeName) => this.factory.get(pipeName));
    return pipes.reduce((previousValue, pipe) => {
      return pipe.apply(previousValue);
    }, value);
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
  if (!value) { throw new Error('missing value'); }
  if (!pipeline) { throw new Error('missing pipeline'); }
  if (!pipeline.trimStart().startsWith('|')) {
    throw new Error('pipeline does not start with pipe');
  }
}
