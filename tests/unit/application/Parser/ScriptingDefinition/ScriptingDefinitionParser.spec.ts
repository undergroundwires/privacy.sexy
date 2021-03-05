import 'mocha';
import { expect } from 'chai';
import { ScriptingLanguage } from '@/domain/ScriptingLanguage';
import { ScriptingDefinitionParser } from '@/application/Parser/ScriptingDefinition/ScriptingDefinitionParser';
import { IEnumParser } from '@/application/Common/Enum';
import { ICodeSubstituter } from '@/application/Parser/ScriptingDefinition/ICodeSubstituter';
import { IScriptingDefinition } from '@/domain/IScriptingDefinition';
import { ProjectInformationStub } from '../../../stubs/ProjectInformationStub';
import { EnumParserStub } from '../../../stubs/EnumParserStub';
import { ScriptingDefinitionDataStub } from '../../../stubs/ScriptingDefinitionDataStub';
import { CodeSubstituterStub } from '../../../stubs/CodeSubstituterStub';

describe('ScriptingDefinitionParser', () => {
    describe('parseScriptingDefinition', () => {
        it('throws when info is undefined', () => {
            // arrange
            const info = undefined;
            const definition = new ScriptingDefinitionDataStub();
            const sut = new ScriptingDefinitionParserBuilder()
                .build();
            // act
            const act = () => sut.parse(definition, info);
            // assert
            expect(act).to.throw('undefined info');
        });
        it('throws when definition is undefined', () => {
            // arrange
            const info = new ProjectInformationStub();
            const definition = undefined;
            const sut = new ScriptingDefinitionParserBuilder()
                .build();
            // act
            const act = () => sut.parse(definition, info);
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
                const definition = new ScriptingDefinitionDataStub()
                    .withLanguage(languageText);
                const parserMock = new EnumParserStub<ScriptingLanguage>()
                    .setup(expectedName, languageText, expectedLanguage);
                const sut = new ScriptingDefinitionParserBuilder()
                    .withParser(parserMock)
                    .build();
                // act
                const actual = sut.parse(definition, info);
                // assert
                expect(actual.language).to.equal(expectedLanguage);
            });
        });
        describe('substitutes code as expected', () => {
            // arrange
            const code = 'hello';
            const expected = 'substituted';
            const testCases = [
                {
                    name: 'startCode',
                    getActualValue: (result: IScriptingDefinition) => result.startCode,
                    data: new ScriptingDefinitionDataStub()
                        .withStartCode(code),
                },
                {
                    name: 'endCode',
                    getActualValue: (result: IScriptingDefinition) => result.endCode,
                    data: new ScriptingDefinitionDataStub()
                        .withEndCode(code),
                },
            ];
            for (const testCase of testCases) {
                it(testCase.name, () => {
                    const info = new ProjectInformationStub();
                    const substituterMock = new CodeSubstituterStub()
                        .setup(code, info, expected);
                    const sut = new ScriptingDefinitionParserBuilder()
                        .withSubstituter(substituterMock)
                        .build();
                    // act
                    const definition = sut.parse(testCase.data, info);
                    // assert
                    const actual = testCase.getActualValue(definition);
                    expect(actual).to.equal(expected);
                });
            }
        });
    });
});

class ScriptingDefinitionParserBuilder {
    private languageParser: IEnumParser<ScriptingLanguage> = new EnumParserStub<ScriptingLanguage>()
        .setupDefaultValue(ScriptingLanguage.shellscript);
    private codeSubstituter: ICodeSubstituter = new CodeSubstituterStub();

    public withParser(parser: IEnumParser<ScriptingLanguage>) {
        this.languageParser = parser;
        return this;
    }
    public withSubstituter(substituter: ICodeSubstituter) {
        this.codeSubstituter = substituter;
        return this;
    }
    public build() {
        return new ScriptingDefinitionParser(this.languageParser, this.codeSubstituter);
    }
}
