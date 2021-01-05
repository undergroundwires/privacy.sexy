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
            // TODO:  expect(expected).to.equal(context.app);
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
                expect(expected).to.equal(context.currentOs);
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
                const actual = context.currentOs;
                expect(expected).to.equal(actual);
            });
            it('fallbacks to most supported os if current os is not supported', () => {
                // TODO: After more than single collection can be parsed
            });
        });
    });
});

function mockParser(result: ICategoryCollection): ApplicationParserType {
    return () => new ApplicationStub().withCollection(result);
}
