import type { CompiledCategoryDto, CompiledScriptDto } from '@/application/Compiler/CompiledCollectionDto';
import { CompiledScriptDtoStub } from './CompiledScriptDtoStub';

export class CompiledCategoryDtoStub implements CompiledCategoryDto {
  public executableId = `${CompiledCategoryDtoStub.name}id`;

  public title = `${CompiledCategoryDtoStub.name}title`;

  public markdownDocs = `${CompiledCategoryDtoStub.name}markdown docs`;

  public categories: readonly CompiledCategoryDto[] = [];

  public scripts: readonly CompiledScriptDto[] = [new CompiledScriptDtoStub()];
}
