import { describe, it, expect } from 'vitest';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { CategoryCollectionStub } from '@tests/unit/shared/Stubs/CategoryCollectionStub';
import { ProjectDetailsStub } from '@tests/unit/shared/Stubs/ProjectDetailsStub';
import type { CategoryCollection } from '@/domain/Collection/CategoryCollection';
import { getAbsentCollectionTestCases } from '@tests/unit/shared/TestCases/AbsentTests';
import { createApplication } from '@/domain/Application/ApplicationFactory';
import type { ProjectDetails } from '@/domain/Project/ProjectDetails';
import type { Application } from '@/domain/Application/Application';

describe('ApplicationFactory', () => {
  describe('projectDetails', () => {
    it('gets correctly', () => {
      // arrange
      const expected = new ProjectDetailsStub();
      // act
      const sut = new TestContext()
        .withProjectDetails(expected)
        .createApplication();
      // assert
      const actual = sut.projectDetails;
      expect(actual).to.equal(expected);
    });
  });
  describe('getCollection', () => {
    it('throws if not found', () => {
      // arrange
      const missingOs = OperatingSystem.Android;
      const expectedError = `Operating system "${OperatingSystem[missingOs]}" is not defined in application`;
      const collections = [new CategoryCollectionStub().withOs(OperatingSystem.Windows)];
      // act
      const app = new TestContext()
        .withCollections(collections)
        .createApplication();
      const act = () => app.getCollection(missingOs);
      // assert
      expect(act).to.throw(expectedError);
    });
    it('returns expected when multiple collections exist', () => {
      // arrange
      const os = OperatingSystem.Windows;
      const expected = new CategoryCollectionStub().withOs(os);
      const collections = [expected, new CategoryCollectionStub().withOs(OperatingSystem.Android)];
      // act
      const app = new TestContext()
        .withCollections(collections)
        .createApplication();
      const actual = app.getCollection(os);
      // assert
      expect(actual).to.equals(expected);
    });
  });
  describe('getSupportedOsList', () => {
    it('returns expected', () => {
      // arrange
      const expected = [OperatingSystem.Windows, OperatingSystem.macOS];
      const collections = expected.map((os) => new CategoryCollectionStub().withOs(os));
      // act
      const app = new TestContext()
        .withCollections(collections)
        .createApplication();
      const actual = app.getSupportedOsList();
      // assert
      expect(actual).to.deep.equal(expected);
    });
  });
  describe('collections', () => {
    describe('throws on invalid value', () => {
      // arrange
      const testCases: readonly {
        readonly name: string,
        readonly expectedError: string,
        readonly value: readonly CategoryCollection[],
      }[] = [
        ...getAbsentCollectionTestCases<CategoryCollection>(
          {
            excludeUndefined: true,
            excludeNull: true,
          },
        ).map((testCase) => ({
          name: `empty collection: ${testCase.valueName}`,
          expectedError: 'missing collections',
          value: testCase.absentValue,
        })),
        {
          name: 'two collections with same OS',
          expectedError: 'multiple collections with same os: windows',
          value: [
            new CategoryCollectionStub().withOs(OperatingSystem.Windows),
            new CategoryCollectionStub().withOs(OperatingSystem.Windows),
            new CategoryCollectionStub().withOs(OperatingSystem.BlackBerry10),
          ],
        },
      ];
      for (const testCase of testCases) {
        it(testCase.name, () => {
          const collections = testCase.value;
          // act
          const act = () => new TestContext()
            .withCollections(collections)
            .createApplication();
          // assert
          expect(act).to.throw(testCase.expectedError);
        });
      }
    });
    it('sets as expected', () => {
      // arrange
      const expected = [new CategoryCollectionStub()];
      // act
      const sut = new TestContext()
        .withCollections(expected)
        .createApplication();
      // assert
      expect(sut.collections).to.equal(expected);
    });
  });
});

class TestContext {
  private projectDetails: ProjectDetails = new ProjectDetailsStub();

  private collections: readonly CategoryCollection[] = [
    new CategoryCollectionStub(),
  ];

  public withProjectDetails(projectDetails: ProjectDetails): this {
    this.projectDetails = projectDetails;
    return this;
  }

  public withCollections(collections: readonly CategoryCollection[]): this {
    this.collections = collections;
    return this;
  }

  public createApplication(): Application {
    return createApplication({
      projectDetails: this.projectDetails,
      collections: this.collections,
    });
  }
}
