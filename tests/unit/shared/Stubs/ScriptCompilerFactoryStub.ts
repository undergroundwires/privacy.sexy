import type { ScriptCompilerFactory, ScriptCompilerInitParameters } from '@/application/Parser/Executable/Script/Compiler/ScriptCompilerFactory';
import type { ScriptCompiler } from '@/application/Parser/Executable/Script/Compiler/ScriptCompiler';
import { ScriptCompilerStub } from './ScriptCompilerStub';

export function createScriptCompilerFactorySpy(): {
  readonly instance: ScriptCompilerFactory;
  getInitParameters: (
    compiler: ScriptCompiler,
  ) => ScriptCompilerInitParameters | undefined;
} {
  const createdCompilers = new Map<ScriptCompiler, ScriptCompilerInitParameters>();
  return {
    instance: (parameters) => {
      const compiler = new ScriptCompilerStub();
      createdCompilers.set(compiler, parameters);
      return compiler;
    },
    getInitParameters: (category) => createdCompilers.get(category),
  };
}
