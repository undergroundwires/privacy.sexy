import 'mocha';
import { expect } from 'chai';
import { ScriptingDefinitionData } from 'js-yaml-loader!@/*';
import { ScriptingLanguage } from '@/domain/ScriptingLanguage';
import { parseScriptingDefinition } from '@/application/Parser/ScriptingDefinitionParser';
import { ProjectInformationStub } from './../../stubs/ProjectInformationStub';
import { mockEnumParser } from '../../stubs/EnumParserStub';

describe('ScriptingDefinitionParser', () => {
    describe('parseScriptingDefinition', () => {
        it('throws when info is undefined', () => {
            // arrange
            const info = undefined;
            const definition = new ScriptingDefinitionBuilder().construct();
            // act
            const act = () => parseScriptingDefinition(definition, info);
            // assert
            expect(act).to.throw('undefined info');
        });
        it('throws when definition is undefined', () => {
            // arrange
            const info = new ProjectInformationStub();
            const definition = undefined;
            // act
            const act = () => parseScriptingDefinition(definition, info);
            // assert
            expect(act).to.throw('undefined definition');
        });
        describe('language', () => {
            it('parses as expected', () => {
                // arrange
                const expectedLanguage = ScriptingLanguage.batchfile;
                const languageText = 'batchfile';
                const expectedName = 'language';
                const info = new ProjectInformationStub();
                const definition = new ScriptingDefinitionBuilder()
                    .withLanguage(languageText)
                    .construct();
                const parserMock = mockEnumParser(expectedName, languageText, expectedLanguage);
                // act
                const actual = parseScriptingDefinition(definition, info, new Date(), parserMock);
                // assert
                expect(actual.language).to.equal(expectedLanguage);
            });
        });
        describe('fileExtension', () => {
            it('parses as expected', () => {
                // arrange
                const expected = 'bat';
                const info = new ProjectInformationStub();
                const file = new ScriptingDefinitionBuilder()
                    .withExtension(expected).construct();
                // act
                const definition = parseScriptingDefinition(file, info);
                // assert
                const actual = definition.fileExtension;
                expect(actual).to.equal(expected);
            });
        });
        describe('startCode', () => {
            it('sets as it is', () => {
                // arrange
                const expected = 'expected-start-code';
                const info = new ProjectInformationStub();
                const file = new ScriptingDefinitionBuilder().withStartCode(expected).construct();
                // act
                const definition = parseScriptingDefinition(file, info);
                // assert
                expect(definition.startCode).to.equal(expected);
            });
            it('substitutes as expected', () => {
                // arrange
                const code = 'homepage: {{ $homepage }}, version: {{ $version }}, date: {{ $date }}';
                const homepage = 'https://cloudarchitecture.io';
                const version = '1.0.2';
                const date = new Date();
                const expected = `homepage: ${homepage}, version: ${version}, date: ${date.toUTCString()}`;
                const info = new ProjectInformationStub().withHomepageUrl(homepage).withVersion(version);
                const file = new ScriptingDefinitionBuilder().withStartCode(code).construct();
                // act
                const definition = parseScriptingDefinition(file, info, date);
                // assert
                const actual = definition.startCode;
                expect(actual).to.equal(expected);
            });
        });
        describe('endCode', () => {
            it('sets as it is', () => {
                // arrange
                const expected = 'expected-end-code';
                const info = new ProjectInformationStub();
                const file = new ScriptingDefinitionBuilder().withEndCode(expected).construct();
                // act
                const definition = parseScriptingDefinition(file, info);
                // assert
                expect(definition.endCode).to.equal(expected);
            });
            it('substitutes as expected', () => {
                // arrange
                const code = 'homepage: {{ $homepage }}, version: {{ $version }}, date: {{ $date }}';
                const homepage = 'https://cloudarchitecture.io';
                const version = '1.0.2';
                const date = new Date();
                const expected = `homepage: ${homepage}, version: ${version}, date: ${date.toUTCString()}`;
                const info = new ProjectInformationStub().withHomepageUrl(homepage).withVersion(version);
                const file = new ScriptingDefinitionBuilder().withEndCode(code).construct();
                // act
                const definition = parseScriptingDefinition(file, info, date);
                // assert
                const actual = definition.endCode;
                expect(actual).to.equal(expected);
            });
        });
    });
});

class ScriptingDefinitionBuilder {
    private language = ScriptingLanguage[ScriptingLanguage.batchfile];
    private fileExtension = 'bat';
    private startCode = 'startCode';
    private endCode = 'endCode';

    public withLanguage(language: string): ScriptingDefinitionBuilder {
        this.language = language;
        return this;
    }

    public withStartCode(startCode: string): ScriptingDefinitionBuilder {
        this.startCode = startCode;
        return this;
    }

    public withEndCode(endCode: string): ScriptingDefinitionBuilder {
        this.endCode = endCode;
        return this;
    }

    public withExtension(extension: string): ScriptingDefinitionBuilder {
        this.fileExtension = extension;
        return this;
    }

    public construct(): ScriptingDefinitionData {
        return {
            language: this.language,
            fileExtension: this.fileExtension,
            startCode: this.startCode,
            endCode: this.endCode,
        };
    }
}
