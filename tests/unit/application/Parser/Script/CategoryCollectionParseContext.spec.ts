import 'mocha';
import { expect } from 'chai';
import { ISyntaxFactory } from '@/application/Parser/Script/Syntax/ISyntaxFactory';
import { ScriptingLanguage } from '@/domain/ScriptingLanguage';
import { LanguageSyntaxStub } from '../../../stubs/LanguageSyntaxStub';
import { CategoryCollectionParseContext } from '@/application/Parser/Script/CategoryCollectionParseContext';
import { ScriptingDefinitionStub } from '../../../stubs/ScriptingDefinitionStub';
import { FunctionDataStub } from '../../../stubs/FunctionDataStub';
import { ILanguageSyntax } from '@/domain/ScriptCode';
import { ScriptCompiler } from '@/application/Parser/Script/Compiler/ScriptCompiler';
import { FunctionData } from 'js-yaml-loader!*';

describe('CategoryCollectionParseContext', () => {
    describe('ctor', () => {
        describe('functionsData', () => {
            it('can create with empty values', () => {
                // arrange
                const testData: FunctionData[][] = [ undefined, [] ];
                const scripting = new ScriptingDefinitionStub();
                for (const functionsData of testData) {
                    // act
                    const act = () => new CategoryCollectionParseContext(functionsData, scripting);
                    // assert
                    expect(act).to.not.throw();
                }
            });
        });
        it('scripting', () => {
            // arrange
            const expectedError = 'undefined scripting';
            const scripting = undefined;
            const functionsData = [ FunctionDataStub.createWithCode() ];
            // act
            const act = () => new CategoryCollectionParseContext(functionsData, scripting);
            // assert
            expect(act).to.throw(expectedError);
        });
    });
    describe('compiler', () => {
        it('constructed as expected', () => {
            // arrange
            const functionsData = [ FunctionDataStub.createWithCode() ];
            const syntax = new LanguageSyntaxStub();
            const expected = new ScriptCompiler(functionsData, syntax);
            const language = ScriptingLanguage.shellscript;
            const factoryMock = mockFactory(language, syntax);
            const definition = new ScriptingDefinitionStub()
                .withLanguage(language);
            // act
            const sut = new CategoryCollectionParseContext(functionsData, definition, factoryMock);
            const actual = sut.compiler;
            // assert
            expect(actual).to.deep.equal(expected);
        });
    });
    describe('syntax', () => {
        it('set from syntax factory', () => {
            // arrange
            const language = ScriptingLanguage.shellscript;
            const expected = new LanguageSyntaxStub();
            const factoryMock = mockFactory(language, expected);
            const definition = new ScriptingDefinitionStub()
                .withLanguage(language);
            // act
            const sut = new CategoryCollectionParseContext([], definition, factoryMock);
            const actual = sut.syntax;
            // assert
            expect(actual).to.equal(expected);
        });
    });
});

function mockFactory(expectedLanguage: ScriptingLanguage, result: ILanguageSyntax): ISyntaxFactory {
    return {
        create: (language: ScriptingLanguage) =>  {
            if (language !== expectedLanguage) {
                throw new Error('unexpected language');
            }
            return result;
        },
    };
}
