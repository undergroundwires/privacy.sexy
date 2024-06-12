export interface IPipelineCompiler {
  compile(value: string, pipeline: string): string;
}
