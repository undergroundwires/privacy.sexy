import 'mocha';
import { expect } from 'chai';
import { parseProjectInformation } from '@/application/Parser/ProjectInformationParser';
import { getProcessEnvironmentStub } from '../../stubs/ProcessEnvironmentStub';

describe('ProjectInformationParser', () => {
    describe('parseProjectInformation', () => {
        it('parses expected repository version', () => {
            // arrange
            const expected = 'expected-version';
            const env = getProcessEnvironmentStub();
            env.VUE_APP_VERSION = expected;
            // act
            const info = parseProjectInformation(env);
            // assert
            expect(info.version).to.be.equal(expected);
        });
        it('parses expected repository url', () => {
            // arrange
            const expected = 'https://expected-repository.url';
            const env = getProcessEnvironmentStub();
            env.VUE_APP_REPOSITORY_URL = expected;
            // act
            const info = parseProjectInformation(env);
            // assert
            expect(info.repositoryUrl).to.be.equal(expected);
        });
        it('parses expected name', () => {
            // arrange
            const expected = 'expected-app-name';
            const env = getProcessEnvironmentStub();
            env.VUE_APP_NAME = expected;
            // act
            const info = parseProjectInformation(env);
            // assert
            expect(info.name).to.be.equal(expected);
        });
        it('parses expected homepage url', () => {
            // arrange
            const expected = 'https://expected.sexy';
            const env = getProcessEnvironmentStub();
            env.VUE_APP_HOMEPAGE_URL = expected;
            // act
            const info = parseProjectInformation(env);
            // assert
            expect(info.homepage).to.be.equal(expected);
        });
    });
});
