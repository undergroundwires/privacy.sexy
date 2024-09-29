export interface CompiledCollectionDto {
  readonly os: string;
  readonly startCode: string;
  readonly endCode: string;
  readonly language: string;
  readonly rootCategories: readonly CompiledCategoryDto[];
}

export interface CompiledExecutableDto {
  readonly markdownDocs: string;
  readonly title: string;
  readonly executableId: string;
}

export interface CompiledScriptDto extends CompiledExecutableDto {
  readonly code: string;
  readonly revertCode: string;
}

export interface CompiledCategoryDto extends CompiledExecutableDto {
  readonly categories: readonly CompiledCategoryDto[];
  readonly scripts: readonly CompiledScriptDto[];
}
