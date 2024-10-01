import { describe, it, expect } from 'vitest';
import { ensureUniqueIdsAcrossExecutables } from '@/domain/Collection/Validation/Rules/EnsureUniqueIdsAcrossExecutables';
import type { Category } from '@/domain/Executables/Category/Category';
import type { Script } from '@/domain/Executables/Script/Script';
import { CategoryCollectionValidationContextStub } from '@tests/unit/shared/Stubs/CategoryCollectionValidationContextStub';
import { CategoryStub } from '@tests/unit/shared/Stubs/CategoryStub';
import { ScriptStub } from '@tests/unit/shared/Stubs/ScriptStub';
import type { ExecutableId } from '@/domain/Executables/Identifiable';

describe('ensureUniqueIdsAcrossExecutables', () => {
  it('does not throw an error when all IDs are unique', () => {
    // arrange
    const testData: TestData = {
      categories: [
        new CategoryStub('category1'),
        new CategoryStub('category2'),
      ],
      scripts: [
        new ScriptStub('script1'),
        new ScriptStub('script2'),
      ],
    };

    // act
    const act = () => test(testData);

    // assert
    expect(act).to.not.throw();
  });

  it('throws an error when duplicate IDs are found across categories and scripts', () => {
    // arrange
    const duplicateId: ExecutableId = 'duplicate';
    const expectedErrorMessage = `Duplicate executable IDs found: "${duplicateId}"`;
    const testData: TestData = {
      categories: [
        new CategoryStub(duplicateId),
        new CategoryStub('category2'),
      ],
      scripts: [
        new ScriptStub(duplicateId),
        new ScriptStub('script2'),
      ],
    };

    // act
    const act = () => test(testData);

    // assert
    expect(act).to.throw(expectedErrorMessage);
  });

  it('throws an error when duplicate IDs are found within categories', () => {
    // arrange
    const duplicateId: ExecutableId = 'duplicate';
    const expectedErrorMessage = `Duplicate executable IDs found: "${duplicateId}"`;
    const testData: TestData = {
      categories: [
        new CategoryStub(duplicateId),
        new CategoryStub(duplicateId),
      ],
      scripts: [
        new ScriptStub('script1'),
        new ScriptStub('script2'),
      ],
    };

    // act
    const act = () => test(testData);

    // assert
    expect(act).to.throw(expectedErrorMessage);
  });

  it('throws an error when duplicate IDs are found within scripts', () => {
    // arrange
    const duplicateId: ExecutableId = 'duplicate';
    const expectedErrorMessage = `Duplicate executable IDs found: "${duplicateId}"`;
    const testData: TestData = {
      categories: [
        new CategoryStub('category1'),
        new CategoryStub('category2'),
      ],
      scripts: [
        new ScriptStub(duplicateId),
        new ScriptStub(duplicateId),
      ],
    };

    // act
    const act = () => test(testData);

    // assert
    expect(act).to.throw(expectedErrorMessage);
  });

  it('throws an error with multiple duplicate IDs', () => {
    // arrange
    const duplicateId1: ExecutableId = 'duplicate-1';
    const duplicateId2: ExecutableId = 'duplicate-2';
    const expectedErrorMessage = `Duplicate executable IDs found: "${duplicateId1}", "${duplicateId2}"`;
    const testData: TestData = {
      categories: [
        new CategoryStub(duplicateId1),
        new CategoryStub(duplicateId2),
      ],
      scripts: [
        new ScriptStub(duplicateId1),
        new ScriptStub(duplicateId2),
      ],
    };

    // act
    const act = () => test(testData);

    // assert
    expect(act).to.throw(expectedErrorMessage);
  });

  it('handles empty categories and scripts arrays', () => {
    // arrange
    const testData: TestData = {
      categories: [],
      scripts: [],
    };

    // act
    const act = () => test(testData);

    // assert
    expect(act).to.not.throw();
  });
});

interface TestData {
  readonly categories: readonly Category[];
  readonly scripts: readonly Script[];
}

function test(testData: TestData):
ReturnType<typeof ensureUniqueIdsAcrossExecutables> {
  const context = new CategoryCollectionValidationContextStub()
    .withAllCategories(testData.categories)
    .withAllScripts(testData.scripts);
  return ensureUniqueIdsAcrossExecutables(context);
}
