import { describe, it, expect } from 'vitest';
import type { CollectionData } from '@/application/collections/';
import { CollectionDataStub } from '@tests/unit/shared/Stubs/CollectionDataStub';
import type { NonEmptyCollectionAssertion, TypeValidator } from '@/application/Compiler/Common/TypeValidator';
import { TypeValidatorStub } from '@tests/unit/shared/Stubs/TypeValidatorStub';
import type { ProjectDetails } from '@/domain/Project/ProjectDetails';
import { ProjectDetailsStub } from '@tests/unit/shared/Stubs/ProjectDetailsStub';
import type { SingleCollectionCompiler } from '@/application/Compiler/Collection/SingleCollectionCompiler';
import { SingleCollectionCompilerStub } from '@tests/unit/shared/Stubs/SingleCollectionCompiler';
import { compileCollections } from '@/application/Compiler/MultipleCollectionsCompiler';
import type { CompiledCollectionDto } from '@/application/Compiler/CompiledCollectionDto';
import { CompiledCollectionDtoStub } from '@tests/unit/shared/Stubs/CompiledCollectionDtoStub';

describe('CollectionsCompiler', () => {
  describe('compileCollections', () => {
    it('validates non empty collections', () => {
      // arrange
      const data = [new CollectionDataStub()];
      const expectedAssertion: NonEmptyCollectionAssertion = {
        value: data,
        valueName: 'Collections',
      };
      const validator = new TypeValidatorStub();
      const context = new TestContext()
        .withCollectionsData(data)
        .withTypeValidator(validator);
      // act
      context.compile();
      // assert
      validator.expectNonEmptyCollectionAssertion(expectedAssertion);
    });
    it('compiles all collections', () => {
      // arrange
      const expectedCollections: Map<CollectionData, CompiledCollectionDto> = new Map([
        [new CollectionDataStub(), new CompiledCollectionDtoStub()],
        [new CollectionDataStub(), new CompiledCollectionDtoStub()],
      ]);
      const compilerStub = new SingleCollectionCompilerStub();
      expectedCollections.forEach((result, data) => {
        compilerStub.withReturnValue(data, result);
      });
      const context = new TestContext()
        .withCollectionCompiler(compilerStub.getStub());
      // act
      const actualResult = context.compile();
      // assert
      const expectedResult = [...expectedCollections.keys()];
      expect(actualResult).to.have.lengthOf(expectedResult.length);
      expect(actualResult).to.have.members(expectedResult);
    });
    it('compiles collections using given project details', () => {
      // arrange
      const expectedDetails = new ProjectDetailsStub();
      const compilerStub = new SingleCollectionCompilerStub();
      const context = new TestContext()
        .withProjectDetails(expectedDetails)
        .withCollectionCompiler(compilerStub.getStub());
      // act
      context.compile();
      // assert
      const actualDetails = compilerStub.callHistory.map((c) => c.projectDetails);
      const unexpectedDetails = actualDetails.map((d) => d !== expectedDetails);
      expect(unexpectedDetails).to.have.lengthOf(0);
    });
  });
});

class TestContext {
  private collectionCompiler
  : SingleCollectionCompiler = new SingleCollectionCompilerStub().getStub();

  private projectDetails: ProjectDetails = new ProjectDetailsStub();

  private validator: TypeValidator = new TypeValidatorStub();

  private collectionData: readonly CollectionData[] = [new CollectionDataStub()];

  public withCollectionCompiler(
    collectionCompiler: SingleCollectionCompiler,
  ): this {
    this.collectionCompiler = collectionCompiler;
    return this;
  }

  public withCollectionsData(
    collectionData: readonly CollectionData[],
  ): this {
    this.collectionData = collectionData;
    return this;
  }

  public withProjectDetails(
    projectDetails: ProjectDetails,
  ): this {
    this.projectDetails = projectDetails;
    return this;
  }

  public withTypeValidator(validator: TypeValidator): this {
    this.validator = validator;
    return this;
  }

  public compile(): ReturnType<typeof compileCollections> {
    return compileCollections(
      this.collectionData,
      this.projectDetails,
      {
        validator: this.validator,
        compileCollection: this.collectionCompiler,
      },
    );
  }
}
