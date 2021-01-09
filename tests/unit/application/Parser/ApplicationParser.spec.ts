import 'mocha';
import { expect } from 'chai';
import { parseProjectInformation } from '@/application/Parser/ProjectInformationParser';
import { CategoryCollectionParserType, parseApplication } from '@/application/Parser/ApplicationParser';
import WindowsData from 'js-yaml-loader!@/application/collections/windows.yaml';
import { CollectionData } from 'js-yaml-loader!@/*';
import { IProjectInformation } from '@/domain/IProjectInformation';
import { ProjectInformation } from '@/domain/ProjectInformation';
import { ICategoryCollection } from '@/domain/ICategoryCollection';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { CategoryCollectionStub } from '../../stubs/CategoryCollectionStub';
import { getProcessEnvironmentStub } from '../../stubs/ProcessEnvironmentStub';
import { CollectionDataStub } from '../../stubs/CollectionDataStub';

describe('ApplicationParser', () => {
    describe('parseApplication', () => {
        it('can parse current application', () => { // Integration test
            // act
            const act = () => parseApplication();
            // assert
            expect(act).to.not.throw();
        });
        describe('parser', () => {
            it('returns result from the parser', () => {
                // arrange
                const os = OperatingSystem.macOS;
                const expected = new CategoryCollectionStub()
                    .withOs(os);
                const parser = new CategoryCollectionParserSpy()
                    .setResult(expected)
                    .mockParser();
                // act
                const context = parseApplication(parser);
                // assert
                const actual = context.getCollection(os);
                expect(expected).to.equal(actual);
            });
        });
        describe('processEnv', () => {
            it('used to parse expected project information', () => {
                // arrange
                const env = getProcessEnvironmentStub();
                const expected = parseProjectInformation(env);
                const parserSpy = new CategoryCollectionParserSpy();
                const parserMock = parserSpy.mockParser();
                // act
                const context = parseApplication(parserMock, env);
                // assert
                expect(expected).to.deep.equal(context.info);
                expect(expected).to.deep.equal(parserSpy.lastArguments.info);
            });
            it('defaults to process.env', () => {
                // arrange
                const env = process.env;
                const expected = parseProjectInformation(env);
                const parserSpy = new CategoryCollectionParserSpy();
                const parserMock = parserSpy.mockParser();
                // act
                const context = parseApplication(parserMock);
                // assert
                expect(expected).to.deep.equal(context.info);
                expect(expected).to.deep.equal(parserSpy.lastArguments.info);
            });
        });
        describe('collectionData', () => {
            it('parsed with expected data', () => {
                // arrange
                const expected = new CollectionDataStub();
                const env = getProcessEnvironmentStub();
                const parserSpy = new CategoryCollectionParserSpy();
                const parserMock = parserSpy.mockParser();
                // act
                parseApplication(parserMock, env, expected);
                // assert
                expect(expected).to.equal(parserSpy.lastArguments.file);
            });
            it('defaults to windows data', () => {
                // arrange
                const expected = WindowsData;
                const parserSpy = new CategoryCollectionParserSpy();
                const parserMock = parserSpy.mockParser();
                // act
                parseApplication(parserMock);
                // assert
                expect(expected).to.equal(parserSpy.lastArguments.file);
            });
        });
    });
});

class CategoryCollectionParserSpy {
    public lastArguments: {
        file: CollectionData;
        info: ProjectInformation;
    } = { file: undefined, info: undefined };
    private result: ICategoryCollection = new CategoryCollectionStub();

    public setResult(collection: ICategoryCollection): CategoryCollectionParserSpy {
        this.result = collection;
        return this;
    }
    public mockParser(): CategoryCollectionParserType {
        return (file: CollectionData, info: IProjectInformation) => {
            this.lastArguments.file = file;
            this.lastArguments.info = info;
            return this.result;
        };
    }
}
