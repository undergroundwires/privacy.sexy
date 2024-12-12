import { describe, it, expect } from 'vitest';
import type { CollectionData } from '@/application/collections/';
import { parseProjectDetails } from '@/application/Parser/Project/ProjectDetailsParser';
import { parseApplication } from '@/application/Parser/ApplicationParser';
import WindowsData from '@/application/collections/windows.yaml';
import MacOsData from '@/application/collections/macos.yaml';
import LinuxData from '@/application/collections/linux.yaml';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { CategoryCollectionStub } from '@tests/unit/shared/Stubs/CategoryCollectionStub';
import { CollectionDataStub } from '@tests/unit/shared/Stubs/CollectionDataStub';
import { CategoryCollectionParserStub } from '@tests/unit/shared/Stubs/CategoryCollectionParserStub';
import { ProjectDetailsParserStub } from '@tests/unit/shared/Stubs/ProjectDetailsParserStub';
import { ProjectDetailsStub } from '@tests/unit/shared/Stubs/ProjectDetailsStub';
import type { CategoryCollectionParser } from '@/application/Parser/CategoryCollectionParser';
import type { NonEmptyCollectionAssertion, TypeValidator } from '@/application/Parser/Common/TypeValidator';
import { TypeValidatorStub } from '@tests/unit/shared/Stubs/TypeValidatorStub';
import type { ICategoryCollection } from '@/domain/Collection/ICategoryCollection';

describe('ApplicationParser', () => {
  describe('parseApplication', () => {
    describe('categoryParser', () => {
      it('returns result from the parser', () => {
        // arrange
        const os = OperatingSystem.macOS;
        const data = new CollectionDataStub();
        const expected = new CategoryCollectionStub()
          .withOs(os);
        const parser = new CategoryCollectionParserStub()
          .withReturnValue(data, expected)
          .getStub();
        const sut = new ApplicationParserBuilder()
          .withCategoryCollectionParser(parser)
          .withCollectionsData([data]);
        // act
        const app = sut.parseApplication();
        // assert
        const actual = app.getCollection(os);
        expect(expected).to.equal(actual);
      });
    });
    describe('projectDetails', () => {
      it('projectDetailsParser is used to create the instance', () => {
        // arrange
        const expectedProjectDetails = new ProjectDetailsStub();
        const projectDetailsParserStub = new ProjectDetailsParserStub()
          .withReturnValue(expectedProjectDetails);
        const sut = new ApplicationParserBuilder()
          .withProjectDetailsParser(projectDetailsParserStub.getStub());
        // act
        const app = sut.parseApplication();
        // assert
        const actualProjectDetails = app.projectDetails;
        expect(expectedProjectDetails).to.deep.equal(actualProjectDetails);
      });
      it('projectDetailsParser is used to parse collection', () => {
        // arrange
        const expectedProjectDetails = new ProjectDetailsStub();
        const projectDetailsParserStub = new ProjectDetailsParserStub()
          .withReturnValue(expectedProjectDetails);
        const collectionParserStub = new CategoryCollectionParserStub();
        const sut = new ApplicationParserBuilder()
          .withProjectDetailsParser(projectDetailsParserStub.getStub())
          .withCategoryCollectionParser(collectionParserStub.getStub());
        // act
        sut.parseApplication();
        // assert
        expect(collectionParserStub.arguments).to.have.length.above(0);
        const actuallyUsedInfos = collectionParserStub.arguments.map((arg) => arg.projectDetails);
        expect(actuallyUsedInfos.every(
          (actualProjectDetails) => actualProjectDetails === expectedProjectDetails,
        )).to.equal(true);
      });
    });
    describe('collectionsData', () => {
      describe('set as expected', () => {
        // arrange
        const testScenarios: {
          readonly description: string;
          readonly input: readonly CollectionData[];
          readonly output: readonly ICategoryCollection[];
        }[] = [
          {
            description: 'single collection',
            input: [new CollectionDataStub()],
            output: [new CategoryCollectionStub().withOs(OperatingSystem.macOS)],
          },
          {
            description: 'multiple collections',
            input: [
              new CollectionDataStub().withOs('windows'),
              new CollectionDataStub().withOs('macos'),
            ],
            output: [
              new CategoryCollectionStub().withOs(OperatingSystem.macOS),
              new CategoryCollectionStub().withOs(OperatingSystem.Windows),
            ],
          },
        ];
        // act
        testScenarios.forEach(({
          description, input, output,
        }) => {
          it(description, () => {
            let categoryParserStub = new CategoryCollectionParserStub();
            for (let i = 0; i < input.length; i++) {
              categoryParserStub = categoryParserStub
                .withReturnValue(input[i], output[i]);
            }
            const sut = new ApplicationParserBuilder()
              .withCategoryCollectionParser(categoryParserStub.getStub())
              .withCollectionsData(input);
            // act
            const app = sut.parseApplication();
            // assert
            expect(app.collections).to.deep.equal(output);
          });
        });
      });
      it('defaults to expected data', () => {
        // arrange
        const expected = [WindowsData, MacOsData, LinuxData];
        const categoryParserStub = new CategoryCollectionParserStub();
        const sut = new ApplicationParserBuilder()
          .withCollectionsData(undefined)
          .withCategoryCollectionParser(categoryParserStub.getStub());
        // act
        sut.parseApplication();
        // assert
        const actual = categoryParserStub.arguments.map((args) => args.data);
        expect(actual).to.deep.equal(expected);
      });
      it('validates non empty array', () => {
        // arrange
        const data = [new CollectionDataStub()];
        const expectedAssertion: NonEmptyCollectionAssertion = {
          value: data,
          valueName: 'Collections',
        };
        const validator = new TypeValidatorStub();
        const sut = new ApplicationParserBuilder()
          .withCollectionsData(data)
          .withTypeValidator(validator);
        // act
        sut.parseApplication();
        // assert
        validator.expectNonEmptyCollectionAssertion(expectedAssertion);
      });
    });
  });
});

class ApplicationParserBuilder {
  private categoryCollectionParser
  : CategoryCollectionParser = new CategoryCollectionParserStub().getStub();

  private projectDetailsParser
  : typeof parseProjectDetails = new ProjectDetailsParserStub().getStub();

  private validator: TypeValidator = new TypeValidatorStub();

  private collectionsData: readonly CollectionData[] | undefined = [new CollectionDataStub()];

  public withCategoryCollectionParser(
    categoryCollectionParser: CategoryCollectionParser,
  ): this {
    this.categoryCollectionParser = categoryCollectionParser;
    return this;
  }

  public withProjectDetailsParser(
    projectDetailsParser: typeof parseProjectDetails,
  ): this {
    this.projectDetailsParser = projectDetailsParser;
    return this;
  }

  public withCollectionsData(collectionsData: readonly CollectionData[] | undefined): this {
    this.collectionsData = collectionsData;
    return this;
  }

  public withTypeValidator(validator: TypeValidator): this {
    this.validator = validator;
    return this;
  }

  public parseApplication(): ReturnType<typeof parseApplication> {
    return parseApplication(
      this.collectionsData,
      {
        parseCategoryCollection: this.categoryCollectionParser,
        parseProjectDetails: this.projectDetailsParser,
        validator: this.validator,
      },
    );
  }
}
