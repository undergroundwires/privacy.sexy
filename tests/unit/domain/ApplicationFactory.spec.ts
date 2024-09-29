import { describe, it, expect } from 'vitest';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { CategoryCollectionStub } from '@tests/unit/shared/Stubs/CategoryCollectionStub';
import { ProjectDetailsStub } from '@tests/unit/shared/Stubs/ProjectDetailsStub';
import type { CategoryCollection } from '@/domain/Collection/CategoryCollection';
import { getAbsentCollectionTestCases } from '@tests/unit/shared/TestCases/AbsentTests';
import { createApplication, type ApplicationFactory } from '@/domain/ApplicationFactory';
import type { ProjectDetails } from '@/domain/Project/ProjectDetails';

describe('ApplicationFactory', () => {
  describe('createApplication', () => {
    describe('getCollection', () => {
      it('throws error for unsupported operating system', () => {
        // arrange
        const missingOs = OperatingSystem.Android;
        const expectedError = `Operating system "${OperatingSystem[missingOs]}" is not defined in application`;
        const collections = [new CategoryCollectionStub().withOs(OperatingSystem.Windows)];
        const context = new TestContext()
          .withCollections(collections);
        // act
        const app = context.create();
        const act = () => app.getCollection(missingOs);
        // assert
        expect(act).to.throw(expectedError);
      });
      it('returns correct collection for supported operating system', () => {
        // arrange
        const os = OperatingSystem.Windows;
        const expected = new CategoryCollectionStub().withOs(os);
        const collections: readonly CategoryCollection[] = [
          expected,
          new CategoryCollectionStub().withOs(OperatingSystem.Android),
        ];
        const context = new TestContext()
          .withCollections(collections);
        // act
        const app = context.create();
        const actual = app.getCollection(os);
        // assert
        expect(actual).to.equals(expected);
      });
    });
    describe('projectDetails', () => {
      it('returns provided project details', () => {
        // arrange
        const expectedProjectDetails = new ProjectDetailsStub();
        const context = new TestContext()
          .withProjectDetails(expectedProjectDetails);
        // act
        const app = context.create();
        // assert
        const actualProjectDetails = app.projectDetails;
        expect(actualProjectDetails).to.equal(expectedProjectDetails);
      });
    });
    describe('collections', () => {
      describe('validation', () => {
        // arrange
        const testScenarios: readonly {
          readonly description: string,
          readonly expectedError: string,
          readonly value: readonly CategoryCollection[],
        }[] = [
          ...getAbsentCollectionTestCases<CategoryCollection>(
            {
              excludeUndefined: true,
              excludeNull: true,
            },
          ).map((testCase) => ({
            description: `throws error for empty "${testCase.valueName}" collection`,
            expectedError: 'missing collections',
            value: testCase.absentValue,
          })),
          {
            description: 'throws error for duplicate operating systems',
            expectedError: 'multiple collections with same os: windows',
            value: [
              new CategoryCollectionStub().withOs(OperatingSystem.Windows),
              new CategoryCollectionStub().withOs(OperatingSystem.Windows),
              new CategoryCollectionStub().withOs(OperatingSystem.BlackBerry10),
            ],
          },
        ];
        for (const testCase of testScenarios) {
          it(testCase.description, () => {
            const collections = testCase.value;
            const context = new TestContext()
              .withCollections(collections);
            // act
            const act = () => context.create();
            // assert
            expect(act).to.throw(testCase.expectedError);
          });
        }
      });
      it('returns provided collections', () => {
        // arrange
        const expectedCollections: readonly CategoryCollection[] = [
          new CategoryCollectionStub(),
        ];
        const context = new TestContext()
          .withCollections(expectedCollections);
        // act
        const app = context.create();
        // assert
        const actualCollections = app.collections;
        expect(actualCollections).to.equal(expectedCollections);
      });
    });
    describe('getSupportedOsList', () => {
      it('returns list of supported operating systems', () => {
        // arrange
        const expected = [OperatingSystem.Windows, OperatingSystem.macOS];
        const collections = expected.map((os) => new CategoryCollectionStub().withOs(os));
        const context = new TestContext()
          .withCollections(collections);
        // act
        const app = context.create();
        const actual = app.getSupportedOsList();
        // assert
        expect(actual).to.deep.equal(expected);
      });
    });
  });
});

class TestContext {
  private projectDetails: ProjectDetails = new ProjectDetailsStub();

  private collections: readonly CategoryCollection[] = [new CategoryCollectionStub()];

  public withProjectDetails(projectDetails: ProjectDetails): this {
    this.projectDetails = projectDetails;
    return this;
  }

  public withCollections(collections: readonly CategoryCollection[]): this {
    this.collections = collections;
    return this;
  }

  public create(): ReturnType<ApplicationFactory> {
    return createApplication({
      projectDetails: this.projectDetails,
      collections: this.collections,
    });
  }
}
