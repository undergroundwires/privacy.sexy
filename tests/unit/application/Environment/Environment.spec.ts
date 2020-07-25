import { IBrowserOsDetector } from '@/application/Environment/BrowserOs/IBrowserOsDetector';
import { OperatingSystem } from '@/application/Environment/OperatingSystem';
import { DesktopOsTestCases } from './DesktopOsTestCases';
import { Environment } from '@/application/Environment/Environment';
import { expect } from 'chai';

interface EnvironmentVariables {
    window?: any;
    process?: any;
    navigator?: any;
}

class SystemUnderTest extends Environment {
    constructor(variables: EnvironmentVariables, browserOsDetector?: IBrowserOsDetector) {
        super(variables as any, browserOsDetector);
    }
}

describe('Environment', () => {
    describe('isDesktop', () => {
        it('returns true if process type is renderer', () => {
            // arrange
            const window = {
                process: {
                    type: 'renderer',
                },
            };
            // act
            const sut = new SystemUnderTest({ window });
            // assert
            expect(sut.isDesktop).to.equal(true);
        });
        it('returns true if electron is defined as process version', () => {
            // arrange
            const process = {
                versions: {
                    electron: true,
                },
            };
            // act
            const sut = new SystemUnderTest({ process });
            // assert
            expect(sut.isDesktop).to.equal(true);
        });
        it('returns true if navigator user agent has electron', () => {
            // arrange
            const navigator = {
                userAgent: 'Electron',
            };
            // act
            const sut = new SystemUnderTest( { navigator });
            // assert
            expect(sut.isDesktop).to.equal(true);
        });
        it('returns false as default', () => {
            const sut = new SystemUnderTest({ });
            expect(sut.isDesktop).to.equal(false);
        });
    });
    describe('os', () => {
        describe('browser os from BrowserOsDetector', () => {
            // arrange
            const givenUserAgent = 'testUserAgent';
            const expected = OperatingSystem.macOS;
            const window = {
                navigator: {
                    userAgent: givenUserAgent,
                },
            };
            const mock: IBrowserOsDetector = {
                detect: (agent) => {
                    if (agent !== givenUserAgent) {
                        throw new Error('Unexpected user agent');
                    }
                    return expected;
                },
            };
            // act
            const sut = new SystemUnderTest({ window }, mock);
            const actual = sut.os;
            // assert
            expect(actual).to.equal(expected);
        });
        describe('desktop os', () => {
            const navigator = {
                userAgent: 'Electron',
            };
            for (const testCase of DesktopOsTestCases) {
                // arrange
                const process = {
                    platform: testCase.processPlatform,
                };
                // act
                const sut = new SystemUnderTest({ navigator, process });
                // assert
                expect(sut.os).to.equal(testCase.expectedOs,
                    `Expected: "${OperatingSystem[testCase.expectedOs]}"\n` +
                    `Actual: "${OperatingSystem[sut.os]}"\n` +
                    `Platform: "${testCase.processPlatform}"`);
            }
        });
    });
});
