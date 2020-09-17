import 'mocha';
import { expect } from 'chai';
import { parseScript } from '@/application/Parser/ScriptParser';
import { parseDocUrls } from '@/application/Parser/DocumentationParser';
import { RecommendationLevelNames, RecommendationLevel } from '@/domain/RecommendationLevel';
import { ScriptCode } from '@/domain/ScriptCode';
import { ScriptCompilerStub } from '../../stubs/ScriptCompilerStub';
import { YamlScriptStub } from '../../stubs/YamlScriptStub';

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
                    const script = YamlScriptStub.createWithCode();
                    script.recommend = undefinedLevel;
                    // act
                    const actual = parseScript(script, compiler);
                    // assert
                    expect(actual.level).to.equal(undefined);
                });
            });
            it('throws on unknown level', () => {
                // arrange
                const unknownLevel = 'boi';
                const compiler = new ScriptCompilerStub();
                const script = YamlScriptStub.createWithCode();
                script.recommend = unknownLevel;
                // act
                const act = () => parseScript(script, compiler);
                // assert
                expect(act).to.throw(`unknown level: "${unknownLevel}"`);
            });
            it('throws on non-string type', () => {
                const nonStringTypes: any[] = [ 5, true ];
                nonStringTypes.forEach((nonStringType) => {
                    // arrange
                    const script = YamlScriptStub.createWithCode();
                    const compiler = new ScriptCompilerStub();
                    script.recommend = nonStringType;
                    // act
                    const act = () => parseScript(script, compiler);
                    // assert
                    expect(act).to.throw(`level must be a string but it was ${typeof nonStringType}`);
                });
            });
            describe('parses level as expected', () => {
                for (const levelText of RecommendationLevelNames) {
                    it(levelText, () => {
                        // arrange
                        const expectedLevel = RecommendationLevel[levelText];
                        const script = YamlScriptStub.createWithCode();
                        const compiler = new ScriptCompilerStub();
                        script.recommend = levelText;
                        // act
                        const actual = parseScript(script, compiler);
                        // assert
                        expect(actual.level).to.equal(expectedLevel);
                    });
                }
            });
            it('parses level case insensitive', () => {
                // arrange
                const script = YamlScriptStub.createWithCode();
                const compiler = new ScriptCompilerStub();
                const expected = RecommendationLevel.Standard;
                script.recommend = RecommendationLevel[expected].toUpperCase();
                // act
                const actual = parseScript(script, compiler);
                // assert
                expect(actual.level).to.equal(expected);
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
