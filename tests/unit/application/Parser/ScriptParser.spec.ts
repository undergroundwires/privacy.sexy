import 'mocha';
import { expect } from 'chai';
import { parseScript } from '@/application/Parser/ScriptParser';
import { parseDocUrls } from '@/application/Parser/DocumentationParser';
import { RecommendationLevel } from '@/domain/RecommendationLevel';
import { ScriptCode } from '@/domain/ScriptCode';
import { ScriptCompilerStub } from '../../stubs/ScriptCompilerStub';
import { YamlScriptStub } from '../../stubs/YamlScriptStub';
import { mockEnumParser } from '../../stubs/EnumParserStub';

describe('ScriptParser', () => {
    describe('parseScript', () => {
        it('parses name as expected', () => {
            // arrange
            const expected = 'test-expected-name';
            const script = YamlScriptStub.createWithCode()
                .withName(expected);
            const compiler = new ScriptCompilerStub();
            // act
            const actual = parseScript(script, compiler);
            // assert
            expect(actual.name).to.equal(expected);
        });
        it('parses docs as expected', () => {
            // arrange
            const docs = [ 'https://expected-doc1.com', 'https://expected-doc2.com' ];
            const script = YamlScriptStub.createWithCode()
                .withDocs(docs);
            const compiler = new ScriptCompilerStub();
            const expected = parseDocUrls(script);
            // act
            const actual = parseScript(script, compiler);
            // assert
            expect(actual.documentationUrls).to.deep.equal(expected);
        });
        describe('invalid script', () => {
            it('throws when script is undefined', () => {
                // arrange
                const expectedError = 'undefined script';
                const compiler = new ScriptCompilerStub();
                const script = undefined;
                // act
                const act = () => parseScript(script, compiler);
                // assert
                expect(act).to.throw(expectedError);
            });
            it('throws when both function call and code are defined', () => {
                // arrange
                const expectedError = 'cannot define both "call" and "code"';
                const compiler = new ScriptCompilerStub();
                const script = YamlScriptStub
                    .createWithCall()
                    .withCode('code');
                // act
                const act = () => parseScript(script, compiler);
                // assert
                expect(act).to.throw(expectedError);
            });
            it('throws when both function call and revertCode are defined', () => {
                // arrange
                const expectedError = 'cannot define "revertCode" if "call" is defined';
                const compiler = new ScriptCompilerStub();
                const script = YamlScriptStub
                    .createWithCall()
                    .withRevertCode('revert-code');
                // act
                const act = () => parseScript(script, compiler);
                // assert
                expect(act).to.throw(expectedError);
            });
            it('throws when neither call or revertCode are defined', () => {
                // arrange
                const expectedError = 'must define either "call" or "code"';
                const compiler = new ScriptCompilerStub();
                const script = YamlScriptStub.createWithoutCallOrCodes();
                // act
                const act = () => parseScript(script, compiler);
                // assert
                expect(act).to.throw(expectedError);
            });
        });
        describe('level', () => {
            it('accepts undefined level', () => {
                const undefinedLevels: string[] = [ '', undefined ];
                undefinedLevels.forEach((undefinedLevel) => {
                    // arrange
                    const compiler = new ScriptCompilerStub();
                    const script = YamlScriptStub.createWithCode()
                        .withRecommend(undefinedLevel);
                    // act
                    const actual = parseScript(script, compiler);
                    // assert
                    expect(actual.level).to.equal(undefined);
                });
            });
            describe('parses level as expected', () => {
                // arrange
                const expectedLevel = RecommendationLevel.Standard;
                const expectedName = 'level';
                const levelText = 'standard';
                const script = YamlScriptStub.createWithCode()
                    .withRecommend(levelText);
                const compiler = new ScriptCompilerStub();
                const parserMock = mockEnumParser(expectedName, levelText, expectedLevel);
                // act
                const actual = parseScript(script, compiler, parserMock);
                // assert
                expect(actual.level).to.equal(expectedLevel);
            });
        });
        describe('code', () => {
            it('parses code as expected', () => {
                // arrange
                const expected = 'expected-code';
                const script = YamlScriptStub
                    .createWithCode()
                    .withCode(expected);
                const compiler = new ScriptCompilerStub();
                // act
                const parsed = parseScript(script, compiler);
                // assert
                const actual = parsed.code.execute;
                expect(actual).to.equal(expected);
            });
            it('parses revertCode as expected', () => {
                // arrange
                const expected = 'expected-revert-code';
                const script = YamlScriptStub
                    .createWithCode()
                    .withRevertCode(expected);
                const compiler = new ScriptCompilerStub();
                // act
                const parsed = parseScript(script, compiler);
                // assert
                const actual = parsed.code.revert;
                expect(actual).to.equal(expected);
            });
            describe('compiler', () => {
                it('throws when compiler is not defined', () => {
                    // arrange
                    const script = YamlScriptStub.createWithCode();
                    const compiler = undefined;
                    // act
                    const act = () => parseScript(script, compiler);
                    // assert
                    expect(act).to.throw('undefined compiler');
                });
                it('gets code from compiler', () => {
                    // arrange
                    const expected = new ScriptCode('test-script', 'code', 'revert-code');
                    const script = YamlScriptStub.createWithCode();
                    const compiler = new ScriptCompilerStub()
                        .withCompileAbility(script, expected);
                    // act
                    const parsed = parseScript(script, compiler);
                    // assert
                    const actual = parsed.code;
                    expect(actual).to.equal(expected);
                });
            });
        });
    });
});

