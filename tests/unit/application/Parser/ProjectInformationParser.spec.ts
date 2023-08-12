import 'mocha';
import { expect } from 'chai';
import { VueAppEnvironmentKeys, parseProjectInformation } from '@/application/Parser/ProjectInformationParser';
import { getProcessEnvironmentStub } from '@tests/unit/shared/Stubs/ProcessEnvironmentStub';
import { IProjectInformation } from '@/domain/IProjectInformation';

describe('ProjectInformationParser', () => {
  describe('parseProjectInformation', () => {
    interface IEnvironmentParsingTestCase {
      readonly testCaseName: string;
      readonly environmentVariableName: string;
      readonly environmentVariableValue: string;
      readonly getActualValue: (info: IProjectInformation) => string;
    }
    const testCases: readonly IEnvironmentParsingTestCase[] = [
      {
        testCaseName: 'version',
        environmentVariableName: VueAppEnvironmentKeys.VUE_APP_VERSION,
        environmentVariableValue: '0.11.3',
        getActualValue: (info) => info.version.toString(),
      },
      {
        testCaseName: 'name',
        environmentVariableName: VueAppEnvironmentKeys.VUE_APP_NAME,
        environmentVariableValue: 'expected-app-name',
        getActualValue: (info) => info.name,
      },
      {
        testCaseName: 'homepage',
        environmentVariableName: VueAppEnvironmentKeys.VUE_APP_HOMEPAGE_URL,
        environmentVariableValue: 'https://expected.sexy',
        getActualValue: (info) => info.homepage,
      },
      {
        testCaseName: 'repositoryUrl',
        environmentVariableName: VueAppEnvironmentKeys.VUE_APP_REPOSITORY_URL,
        environmentVariableValue: 'https://expected-repository.url',
        getActualValue: (info) => info.repositoryUrl,
      },
      {
        testCaseName: 'slogan',
        environmentVariableName: VueAppEnvironmentKeys.VUE_APP_SLOGAN,
        environmentVariableValue: 'expected-slogan',
        getActualValue: (info) => info.slogan,
      },
    ];
    for (const testCase of testCases) {
      it(`${testCase.testCaseName}`, () => {
        // act
        const expected = testCase.environmentVariableValue;
        const env = getProcessEnvironmentStub();
        env[testCase.environmentVariableName] = testCase.environmentVariableValue;
        // act
        const info = parseProjectInformation(env);
        // assert
        const actual = testCase.getActualValue(info);
        expect(actual).to.be.equal(expected);
      });
    }
  });
});
