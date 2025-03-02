import { describe, it, expect } from "vitest";
import { OperatingSystem } from "@/domain/OperatingSystem";
import { EnumRangeTestRunner } from "@/tests/unit/application/Common/EnumRangeTestRunner";
import { VersionStub } from "@tests/unit/shared/Stubs/VersionStub";
import type { PropertyKeys } from "@/TypeHelpers";
import {
  type SupportedOperatingSystem,
  AllSupportedOperatingSystems,
} from "@tests/shared/TestCases/SupportedOperatingSystems";
import type { ProjectDetailsParameters } from "@/application/Parser/Project/ProjectDetailsFactory";
import { createGitHubProjectDetails } from "@/application/Parser/Project/GitHubProjectDetailsFactory";
import { ProjectDetailsParametersStub } from "@tests/unit/shared/Stubs/ProjectDetailsParametersStub";
import type { ProjectDetails } from "@/domain/Project/ProjectDetails";

describe("GitHubProjectDetailsFactory", () => {
  describe("retrieval of property values", () => {
    interface PropertyTestScenario {
      readonly description?: string;
      readonly expectedValue: string;
      readonly prepareParams: (
        params: ProjectDetailsParametersStub,
        expected: string
      ) => ProjectDetailsParameters;
      readonly getActualValue: (sut: ProjectDetails) => string;
    }
    const propertyTestScenarios: {
      readonly [K in PropertyKeys<ProjectDetails>]: readonly PropertyTestScenario[];
    } = {
      name: [
        {
          expectedValue: "expected-app-name",
          prepareParams: (params, expected) => params.withName(expected),
          getActualValue: (sut) => sut.name,
        },
      ],
      version: [
        {
          expectedValue: "0.11.3",
          prepareParams: (params, expected) => params.withVersion(new VersionStub(expected)),
          getActualValue: (sut) => sut.version.toString(),
        },
      ],
      slogan: [
        {
          expectedValue: "expected-slogan",
          prepareParams: (params, expected) => params.withSlogan(expected),
          getActualValue: (sut) => sut.slogan,
        },
      ],
      repositoryUrl: [
        {
          description: "without `.git` suffix",
          expectedValue: "expected-repository-url",
          prepareParams: (builder, expected) => builder.withRepositoryUrl(expected),
          getActualValue: (sut) => sut.repositoryUrl,
        },
        {
          description: "with `.git` suffix",
          expectedValue: "expected-repository-url",
          prepareParams: (builder, expected) => builder.withRepositoryUrl(expected),
          getActualValue: (sut) => sut.repositoryUrl,
        },
      ],
      repositoryWebUrl: [
        {
          description: "without `.git` suffix",
          expectedValue: "expected-repository-url",
          prepareParams: (params, expected) => params.withRepositoryUrl(expected),
          getActualValue: (sut) => sut.repositoryWebUrl,
        },
        {
          description: "with `.git` suffix",
          expectedValue: "expected-repository-url",
          prepareParams: (params, expected) => params.withRepositoryUrl(`${expected}.git`),
          getActualValue: (sut) => sut.repositoryWebUrl,
        },
      ],
      homepage: [
        {
          expectedValue: "expected-homepage",
          prepareParams: (params, expected) => params.withHomepage(expected),
          getActualValue: (sut) => sut.homepage,
        },
      ],
      feedbackUrl: [
        {
          description: "without `.git` suffix",
          expectedValue: "https://github.com/undergroundwires/privacy.sexy/issues",
          prepareParams: (params) =>
            params.withRepositoryUrl("https://github.com/undergroundwires/privacy.sexy"),
          getActualValue: (sut) => sut.feedbackUrl,
        },
        {
          description: "with `.git` suffix",
          expectedValue: "https://github.com/undergroundwires/privacy.sexy/issues",
          prepareParams: (params) =>
            params.withRepositoryUrl("https://github.com/undergroundwires/privacy.sexy.git"),
          getActualValue: (sut) => sut.feedbackUrl,
        },
      ],
      releaseUrl: [
        {
          description: "without `.git` suffix",
          expectedValue: "https://github.com/undergroundwires/privacy.sexy/releases/tag/0.7.2",
          prepareParams: (params) =>
            params
              .withRepositoryUrl("https://github.com/undergroundwires/privacy.sexy")
              .withVersion(new VersionStub("0.7.2")),
          getActualValue: (sut) => sut.releaseUrl,
        },
        {
          description: "with `.git` suffix",
          expectedValue: "https://github.com/undergroundwires/privacy.sexy/releases/tag/0.7.2",
          prepareParams: (params) =>
            params
              .withRepositoryUrl("https://github.com/undergroundwires/privacy.sexy.git")
              .withVersion(new VersionStub("0.7.2")),
          getActualValue: (sut) => sut.releaseUrl,
        },
      ],
    };
    Object.entries(propertyTestScenarios).forEach(([propertyName, testList]) => {
      testList.forEach(({ description, prepareParams, expectedValue, getActualValue }) => {
        it(`${propertyName}${description ? ` (${description})` : ""}`, () => {
          // arrange
          const params = prepareParams(new ProjectDetailsParametersStub(), expectedValue);

          // act
          const sut = create(() => params);
          const actual = getActualValue(sut);

          // assert
          expect(actual).to.equal(expectedValue);
        });
      });
    });
  });
  describe("correct retrieval of download URL for every supported operating system", () => {
    const testScenarios: Record<
      SupportedOperatingSystem,
      {
        readonly expected: string;
        readonly repositoryUrl: string;
        readonly version: string;
      }
    > = {
      [OperatingSystem.macOS]: {
        expected:
          "https://github.com/undergroundwires/privacy.sexy/releases/download/0.7.2/privacy.sexy-0.7.2.dmg",
        repositoryUrl: "https://github.com/undergroundwires/privacy.sexy.git",
        version: "0.7.2",
      },
      [OperatingSystem.Linux]: {
        expected:
          "https://github.com/undergroundwires/privacy.sexy/releases/download/0.7.2/privacy.sexy-0.7.2.AppImage",
        repositoryUrl: "https://github.com/undergroundwires/privacy.sexy.git",
        version: "0.7.2",
      },
      [OperatingSystem.Windows]: {
        expected:
          "https://github.com/undergroundwires/privacy.sexy/releases/download/0.7.2/privacy.sexy-Setup-0.7.2.exe",
        repositoryUrl: "https://github.com/undergroundwires/privacy.sexy.git",
        version: "0.7.2",
      },
    };
    AllSupportedOperatingSystems.forEach((operatingSystem) => {
      it(`should return the expected download URL for ${OperatingSystem[operatingSystem]}`, () => {
        // arrange
        const { expected, version, repositoryUrl } = testScenarios[operatingSystem];
        const sut = create((params) =>
          params.withVersion(new VersionStub(version)).withRepositoryUrl(repositoryUrl)
        );
        // act
        const actual = sut.getDownloadUrl(operatingSystem);
        // assert
        expect(actual).to.equal(expected);
      });
    });
    describe("should throw an error when provided with an invalid operating system", () => {
      // arrange
      const sut = create();
      // act
      const act = (os: OperatingSystem) => sut.getDownloadUrl(os);
      // assert
      new EnumRangeTestRunner(act)
        .testOutOfRangeThrows()
        .testInvalidValueThrows(
          OperatingSystem.KaiOS,
          `Unsupported os: ${OperatingSystem[OperatingSystem.KaiOS]}`
        );
    });
  });
});

function create(
  prepareParams?: (params: ProjectDetailsParametersStub) => ProjectDetailsParameters
) {
  const params: ProjectDetailsParameters = prepareParams
    ? prepareParams(new ProjectDetailsParametersStub())
    : new ProjectDetailsParametersStub();
  return createGitHubProjectDetails(params);
}
