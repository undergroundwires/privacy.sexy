import type { CategoryCollectionValidationContext } from '@/domain/Collection/Validation/CategoryCollectionValidator';
import type { Category } from '@/domain/Executables/Category/Category';
import type { Script } from '@/domain/Executables/Script/Script';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { CategoryStub } from './CategoryStub';
import { ScriptStub } from './ScriptStub';

export class CategoryCollectionValidationContextStub
implements CategoryCollectionValidationContext {
  public allScripts: readonly Script[] = [
    new ScriptStub(`[${CategoryCollectionValidationContextStub.name}] test-script`),
  ];

  public allCategories: readonly Category[] = [
    new CategoryStub(`[${CategoryCollectionValidationContextStub.name}] test-category`),
  ];

  public operatingSystem: OperatingSystem = OperatingSystem.iPadOS;

  public withOperatingSystem(operatingSystem: OperatingSystem): this {
    this.operatingSystem = operatingSystem;
    return this;
  }

  public withAllCategories(allCategories: readonly Category[]): this {
    this.allCategories = allCategories;
    return this;
  }

  public withAllScripts(allScripts: readonly Script[]): this {
    this.allScripts = allScripts;
    return this;
  }
}
