import { describe, it, expect } from 'vitest';
import { ProjectInformation } from '@/domain/ProjectInformation';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { EnumRangeTestRunner } from '@tests/unit/application/Common/EnumRangeTestRunner';
import { VersionStub } from '@tests/unit/shared/Stubs/VersionStub';
import { Version } from '@/domain/Version';

describe('ProjectInformation', () => {
  describe('retrieval of property values', () => {
    interface IPropertyTestCase {
      readonly testCaseName: string;
      readonly expectedValue: string;
      readonly buildWithExpectedValue: (
        builder: ProjectInformationBuilder,
        expected: string,
      ) => ProjectInformationBuilder;
      readonly getActualValue: (sut: ProjectInformation) => string;
    }
    const propertyTestCases: readonly IPropertyTestCase[] = [
      {
        testCaseName: 'name',
        expectedValue: 'expected-name',
        buildWithExpectedValue: (builder, expected) => builder
          .withName(expected),
        getActualValue: (sut) => sut.name,
      },
      {
        testCaseName: 'version',
        expectedValue: '0.11.3',
        buildWithExpectedValue: (builder, expected) => builder
          .withVersion(new VersionStub(expected)),
        getActualValue: (sut) => sut.version.toString(),
      },
      {
        testCaseName: 'repositoryWebUrl - not ending with .git',
        expectedValue: 'expected-repository-url',
        buildWithExpectedValue: (builder, expected) => builder
          .withRepositoryUrl(expected),
        getActualValue: (sut) => sut.repositoryWebUrl,
      },
      {
        testCaseName: 'repositoryWebUrl - ending with .git',
        expectedValue: 'expected-repository-url',
        buildWithExpectedValue: (builder, expected) => builder
          .withRepositoryUrl(`${expected}.git`),
        getActualValue: (sut) => sut.repositoryWebUrl,
      },
      {
        testCaseName: 'slogan',
        expectedValue: 'expected-slogan',
        buildWithExpectedValue: (builder, expected) => builder
          .withSlogan(expected),
        getActualValue: (sut) => sut.slogan,
      },
      {
        testCaseName: 'homepage',
        expectedValue: 'expected-homepage',
        buildWithExpectedValue: (builder, expected) => builder
          .withHomepage(expected),
        getActualValue: (sut) => sut.homepage,
      },
      {
        testCaseName: 'feedbackUrl',
        expectedValue: 'https://github.com/undergroundwires/privacy.sexy/issues',
        buildWithExpectedValue: (builder) => builder
          .withRepositoryUrl('https://github.com/undergroundwires/privacy.sexy.git'),
        getActualValue: (sut) => sut.feedbackUrl,
      },
      {
        testCaseName: 'releaseUrl',
        expectedValue: 'https://github.com/undergroundwires/privacy.sexy/releases/tag/0.7.2',
        buildWithExpectedValue: (builder) => builder
          .withRepositoryUrl('https://github.com/undergroundwires/privacy.sexy.git')
          .withVersion(new VersionStub('0.7.2')),
        getActualValue: (sut) => sut.releaseUrl,
      },
    ];
    for (const testCase of propertyTestCases) {
      it(`should return the expected ${testCase.testCaseName} value`, () => {
        // arrange
        const expected = testCase.expectedValue;
        const builder = new ProjectInformationBuilder();
        const sut = testCase
          .buildWithExpectedValue(builder, expected)
          .build();

        // act
        const actual = testCase.getActualValue(sut);

        // assert
        expect(actual).to.equal(expected);
      });
    }
  });
  describe('correct retrieval of download URL per operating system', () => {
    const testCases: ReadonlyArray<{
      readonly os: OperatingSystem,
      readonly expected: string,
      readonly repositoryUrl: string,
      readonly version: string,
    }> = [
      {
        os: OperatingSystem.macOS,
        expected: 'https://github.com/undergroundwires/privacy.sexy/releases/download/0.7.2/privacy.sexy-0.7.2.dmg',
        repositoryUrl: 'https://github.com/undergroundwires/privacy.sexy.git',
        version: '0.7.2',
      },
      {
        os: OperatingSystem.Linux,
        expected: 'https://github.com/undergroundwires/privacy.sexy/releases/download/0.7.2/privacy.sexy-0.7.2.AppImage',
        repositoryUrl: 'https://github.com/undergroundwires/privacy.sexy.git',
        version: '0.7.2',
      },
      {
        os: OperatingSystem.Windows,
        expected: 'https://github.com/undergroundwires/privacy.sexy/releases/download/0.7.2/privacy.sexy-Setup-0.7.2.exe',
        repositoryUrl: 'https://github.com/undergroundwires/privacy.sexy.git',
        version: '0.7.2',
      },
    ];
    for (const testCase of testCases) {
      it(`should return the expected download URL for ${OperatingSystem[testCase.os]}`, () => {
        // arrange
        const {
          expected, version, repositoryUrl, os,
        } = testCase;
        const sut = new ProjectInformationBuilder()
          .withVersion(new VersionStub(version))
          .withRepositoryUrl(repositoryUrl)
          .build();
          // act
        const actual = sut.getDownloadUrl(os);
        // assert
        expect(actual).to.equal(expected);
      });
    }
    it('should throw an error when provided with an invalid operating system', () => {
      // arrange
      const sut = new ProjectInformationBuilder()
        .build();
      // act
      const act = (os: OperatingSystem) => sut.getDownloadUrl(os);
      // assert
      new EnumRangeTestRunner(act)
        .testOutOfRangeThrows()
        .testAbsentValueThrows()
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
