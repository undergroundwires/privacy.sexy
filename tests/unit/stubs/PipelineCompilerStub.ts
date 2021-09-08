import { IPipelineCompiler } from '@/application/Parser/Script/Compiler/Expressions/Pipes/IPipelineCompiler';

export class PipelineCompilerStub implements IPipelineCompiler {
    public compileHistory: Array<{ value: string, pipeline: string }> = [];
    public compile(value: string, pipeline: string): string {
        this.compileHistory.push({value, pipeline});
        return `value: ${value}"\n${pipeline}: ${pipeline}`;
    }
}
