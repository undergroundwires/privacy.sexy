import type { CompiledCollectionDto } from '@/application/Compiler/CompiledCollectionDto';
import { CompiledCategoryDtoStub } from './CompiledCategoryDtoStub';

export class CompiledCollectionDtoStub implements CompiledCollectionDto {
  public os = `[${CompiledCollectionDtoStub.name}]operating system`;

  public startCode = `[${CompiledCollectionDtoStub.name}]start code`;

  public endCode = `[${CompiledCollectionDtoStub.name}]end code`;

  public language = `[${CompiledCollectionDtoStub.name}]language`;

  public rootCategories = [new CompiledCategoryDtoStub()];

  public withOs(os: string): this {
    this.os = os;
    return this;
  }
}
