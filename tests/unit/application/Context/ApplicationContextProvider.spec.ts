import 'mocha';
import { expect } from 'chai';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { ICategoryCollection } from '@/domain/ICategoryCollection';
import { ApplicationParserType, buildContext } from '@/application/Context/ApplicationContextProvider';
import { CategoryCollectionStub } from '../../stubs/CategoryCollectionStub';
import { EnvironmentStub } from '../../stubs/EnvironmentStub';
import { ApplicationStub } from '../../stubs/ApplicationStub';

describe('ApplicationContextProvider', () => {
    describe('buildContext', () => {
        it('sets application from parser', () => {
            // arrange
            const expected = new ApplicationStub().withCollection(
                new CategoryCollectionStub().withOs(OperatingSystem.macOS));
            const parserMock: ApplicationParserType = () => expected;
            // act
            const context = buildContext(parserMock);
            // assert
            expect(expected).to.equal(context.app);
        });
        describe('sets initial OS as expected', () => {
            it('returns currentOs if it is supported', () => {
                // arrange
                const expected = OperatingSystem.Windows;
                const environment = new EnvironmentStub().withOs(expected);
                const parser = mockParser(new CategoryCollectionStub().withOs(expected));
                // act
                const context = buildContext(parser, environment);
                // assert
                const actual = context.state.os;
                expect(expected).to.equal(actual);
            });
            it('fallbacks to other os if OS in environment is not supported', () => {
                // arrange
                const expected = OperatingSystem.Windows;
                const currentOs = OperatingSystem.macOS;
                const environment = new EnvironmentStub().withOs(currentOs);
                const parser = mockParser(new CategoryCollectionStub().withOs(expected));
                // act
                const context = buildContext(parser, environment);
                // assert
                const actual = context.state.os;
                expect(expected).to.equal(actual);
            });
            it('fallbacks to most supported os if current os is not supported', () => {
                // arrange
                const expectedOs = OperatingSystem.Android;
                const allCollections = [
                    new CategoryCollectionStub().withOs(OperatingSystem.Linux).withTotalScripts(3),
                    new CategoryCollectionStub().withOs(expectedOs).withTotalScripts(5),
                    new CategoryCollectionStub().withOs(OperatingSystem.Windows).withTotalScripts(4),
                ];
                const environment = new EnvironmentStub().withOs(OperatingSystem.macOS);
                const app = new ApplicationStub().withCollections(...allCollections);
                const parser: ApplicationParserType = () => app;
                // act
                const context = buildContext(parser, environment);
                // assert
                const actual = context.state.os;
                expect(expectedOs).to.equal(actual, `Expected: ${OperatingSystem[expectedOs]}, actual: ${OperatingSystem[actual]}`);
            });
        });
    });
});

function mockParser(result: ICategoryCollection): ApplicationParserType {
    return () => new ApplicationStub().withCollection(result);
}
