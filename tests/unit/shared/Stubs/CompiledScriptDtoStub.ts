import type { CompiledScriptDto } from '@/application/Compiler/CompiledCollectionDto';

export class CompiledScriptDtoStub implements CompiledScriptDto {
  public executableId = `[${CompiledScriptDtoStub.name}]id`;

  public markdownDocs = `[${CompiledScriptDtoStub.name}]docs`;

  public title = `[${CompiledScriptDtoStub.name}]title`;

  public code = `[${CompiledScriptDtoStub.name}]code`;

  public revertCode = `[${CompiledScriptDtoStub.name}]revert code`;
}
