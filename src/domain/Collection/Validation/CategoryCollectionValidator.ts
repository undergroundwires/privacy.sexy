import type { Category } from '@/domain/Executables/Category/Category';
import type { Script } from '@/domain/Executables/Script/Script';
import type { OperatingSystem } from '@/domain/OperatingSystem';

export interface CategoryCollectionValidationContext {
  readonly allScripts: readonly Script[];
  readonly allCategories: readonly Category[];
  readonly operatingSystem: OperatingSystem;
}

export interface CategoryCollectionValidator {
  (
    context: CategoryCollectionValidationContext,
  ): void;
}
