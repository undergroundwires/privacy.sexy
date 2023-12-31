import { describe, it, expect } from 'vitest';
import { ProjectInformation } from '@/domain/ProjectInformation';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { EnumRangeTestRunner } from '@tests/unit/application/Common/EnumRangeTestRunner';
import { VersionStub } from '@tests/unit/shared/Stubs/VersionStub';
import { Version } from '@/domain/Version';
import { PropertyKeys } from '@/TypeHelpers';
import { SupportedOperatingSystem, AllSupportedOperatingSystems } from '@tests/shared/TestCases/SupportedOperatingSystems';

describe('ProjectInformation', () => {
  describe('retrieval of property values', () => {
    interface IInformationParsingTestCase {
      readonly description?: string;
      readonly expectedValue: string;
      readonly buildWithExpectedValue: (
        builder: ProjectInformationBuilder,
        expected: string,
      ) => ProjectInformationBuilder;
      readonly getActualValue: (sut: ProjectInformation) => string;
    }
    const propertyTestCases: {
      readonly [K in PropertyKeys<ProjectInformation>]: readonly IInformationParsingTestCase[];
    } = {
      name: [{
        expectedValue: 'expected-app-name',
        buildWithExpectedValue: (builder, expected) => builder
          .withName(expected),
        getActualValue: (sut) => sut.name,
      }],
      version: [{
        expectedValue: '0.11.3',
        buildWithExpectedValue: (builder, expected) => builder
          .withVersion(new VersionStub(expected)),
        getActualValue: (sut) => sut.version.toString(),
      }],
      slogan: [{
        expectedValue: 'expected-slogan',
        buildWithExpectedValue: (builder, expected) => builder
          .withSlogan(expected),
        getActualValue: (sut) => sut.slogan,
      }],
      repositoryUrl: [{
        description: 'without `.git` suffix',
        expectedValue: 'expected-repository-url',
        buildWithExpectedValue: (builder, expected) => builder
          .withRepositoryUrl(expected),
        getActualValue: (sut) => sut.repositoryUrl,
      }, {
        description: 'with `.git` suffix',
        expectedValue: 'expected-repository-url',
        buildWithExpectedValue: (builder, expected) => builder
          .withRepositoryUrl(expected),
        getActualValue: (sut) => sut.repositoryUrl,
      }],
      repositoryWebUrl: [{
        description: 'without `.git` suffix',
        expectedValue: 'expected-repository-url',
        buildWithExpectedValue: (builder, expected) => builder
          .withRepositoryUrl(expected),
        getActualValue: (sut) => sut.repositoryWebUrl,
      }, {
        description: 'with `.git` suffix',
        expectedValue: 'expected-repository-url',
        buildWithExpectedValue: (builder, expected) => builder
          .withRepositoryUrl(`${expected}.git`),
        getActualValue: (sut) => sut.repositoryWebUrl,
      }],
      homepage: [{
        expectedValue: 'expected-homepage',
        buildWithExpectedValue: (builder, expected) => builder
          .withHomepage(expected),
        getActualValue: (sut) => sut.homepage,
      }],
      feedbackUrl: [{
        description: 'without `.git` suffix',
        expectedValue: 'https://github.com/undergroundwires/privacy.sexy/issues',
        buildWithExpectedValue: (builder) => builder
          .withRepositoryUrl('https://github.com/undergroundwires/privacy.sexy'),
        getActualValue: (sut) => sut.feedbackUrl,
      }, {
        description: 'with `.git` suffix',
        expectedValue: 'https://github.com/undergroundwires/privacy.sexy/issues',
        buildWithExpectedValue: (builder) => builder
          .withRepositoryUrl('https://github.com/undergroundwires/privacy.sexy.git'),
        getActualValue: (sut) => sut.feedbackUrl,
      }],
      releaseUrl: [{
        description: 'without `.git` suffix',
        expectedValue: 'https://github.com/undergroundwires/privacy.sexy/releases/tag/0.7.2',
        buildWithExpectedValue: (builder) => builder
          .withRepositoryUrl('https://github.com/undergroundwires/privacy.sexy')
          .withVersion(new VersionStub('0.7.2')),
        getActualValue: (sut) => sut.releaseUrl,
      }, {
        description: 'with `.git` suffix',
        expectedValue: 'https://github.com/undergroundwires/privacy.sexy/releases/tag/0.7.2',
        buildWithExpectedValue: (builder) => builder
          .withRepositoryUrl('https://github.com/undergroundwires/privacy.sexy.git')
          .withVersion(new VersionStub('0.7.2')),
        getActualValue: (sut) => sut.releaseUrl,
      }],
    };
    Object.entries(propertyTestCases).forEach(([propertyName, testList]) => {
      testList.forEach(({
        description, buildWithExpectedValue, expectedValue, getActualValue,
      }) => {
        it(`${propertyName}${description ? ` (${description})` : ''}`, () => {
          // arrange
          const builder = new ProjectInformationBuilder();
          const sut = buildWithExpectedValue(builder, expectedValue).build();

          // act
          const actual = getActualValue(sut);

          // assert
          expect(actual).to.equal(expectedValue);
        });
      });
    });
  });
  describe('correct retrieval of download URL for every supported operating system', () => {
    const testCases: Record<SupportedOperatingSystem, {
      readonly expected: string,
      readonly repositoryUrl: string,
      readonly version: string,
    }> = {
      [OperatingSystem.macOS]: {
        expected: 'https://github.com/undergroundwires/privacy.sexy/releases/download/0.7.2/privacy.sexy-0.7.2.dmg',
        repositoryUrl: 'https://github.com/undergroundwires/privacy.sexy.git',
        version: '0.7.2',
      },
      [OperatingSystem.Linux]: {
        expected: 'https://github.com/undergroundwires/privacy.sexy/releases/download/0.7.2/privacy.sexy-0.7.2.AppImage',
        repositoryUrl: 'https://github.com/undergroundwires/privacy.sexy.git',
        version: '0.7.2',
      },
      [OperatingSystem.Windows]: {
        expected: 'https://github.com/undergroundwires/privacy.sexy/releases/download/0.7.2/privacy.sexy-Setup-0.7.2.exe',
        repositoryUrl: 'https://github.com/undergroundwires/privacy.sexy.git',
        version: '0.7.2',
      },
    };
    AllSupportedOperatingSystems.forEach((operatingSystem) => {
      it(`should return the expected download URL for ${OperatingSystem[operatingSystem]}`, () => {
        // arrange
        const { expected, version, repositoryUrl } = testCases[operatingSystem];
        const sut = new ProjectInformationBuilder()
          .withVersion(new VersionStub(version))
          .withRepositoryUrl(repositoryUrl)
          .build();
        // act
        const actual = sut.getDownloadUrl(operatingSystem);
        // assert
        expect(actual).to.equal(expected);
      });
    });
    describe('should throw an error when provided with an invalid operating system', () => {
      // arrange
      const sut = new ProjectInformationBuilder()
        .build();
      // act
      const act = (os: OperatingSystem) => sut.getDownloadUrl(os);
      // assert
      new EnumRangeTestRunner(act)
        .testOutOfRangeThrows()
        .testInvalidValueThrows(OperatingSystem.KaiOS, `Unsupported os: ${OperatingSystem[OperatingSystem.KaiOS]}`);
    });
  });
});

class ProjectInformationBuilder {
  private name = 'default-name';

  private version: Version = new VersionStub();

  private repositoryUrl = 'default-repository-url';

  private homepage = 'default-homepage';

  private slogan = 'default-slogan';

  public withName(name: string): ProjectInformationBuilder {
    this.name = name;
    return this;
  }

  public withVersion(version: VersionStub): ProjectInformationBuilder {
    this.version = version;
    return this;
  }

  public withSlogan(slogan: string): ProjectInformationBuilder {
    this.slogan = slogan;
    return this;
  }

  public withRepositoryUrl(repositoryUrl: string): ProjectInformationBuilder {
    this.repositoryUrl = repositoryUrl;
    return this;
  }

  public withHomepage(homepage: string): ProjectInformationBuilder {
    this.homepage = homepage;
    return this;
  }

  public build(): ProjectInformation {
    return new ProjectInformation(
      this.name,
      this.version,
      this.slogan,
      this.repositoryUrl,
      this.homepage,
    );
  }
}
