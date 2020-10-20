import { YamlScript } from 'js-yaml-loader!./application.yaml';
import 'mocha';
import { expect } from 'chai';
import { parseScript } from '@/application/Parser/ScriptParser';
import { parseDocUrls } from '@/application/Parser/DocumentationParser';
import { RecommendationLevelNames, RecommendationLevel } from '@/domain/RecommendationLevel';

describe('ScriptParser', () => {
    describe('parseScript', () => {
        it('parses name as expected', () => {
            // arrange
            const script = getValidScript();
            script.name = 'expected-name';
            // act
            const actual = parseScript(script);
            // assert
            expect(actual.name).to.equal(script.name);
        });
        it('parses code as expected', () => {
            // arrange
            const script = getValidScript();
            script.code = 'expected-code';
            // act
            const actual = parseScript(script);
            // assert
            expect(actual.code).to.equal(script.code);
        });
        it('parses revertCode as expected', () => {
            // arrange
            const script = getValidScript();
            script.code = 'expected-code';
            // act
            const actual = parseScript(script);
            // assert
            expect(actual.revertCode).to.equal(script.revertCode);
        });
        it('parses docs as expected', () => {
            // arrange
            const script = getValidScript();
            script.docs = [ 'https://expected-doc1.com', 'https://expected-doc2.com' ];
            const expected = parseDocUrls(script);
            // act
            const actual = parseScript(script);
            // assert
            expect(actual.documentationUrls).to.deep.equal(expected);
        });
        describe('level', () => {
            it('accepts undefined level', () => {
                const undefinedLevels: string[] = [ '', undefined ];
                undefinedLevels.forEach((undefinedLevel) => {
                    // arrange
                    const script = getValidScript();
                    script.recommend = undefinedLevel;
                    // act
                    const actual = parseScript(script);
                    // assert
                    expect(actual.level).to.equal(undefined);
                });
            });
            it('throws on unknown level', () => {
                // arrange
                const unknownLevel = 'boi';
                const script = getValidScript();
                script.recommend = unknownLevel;
                // act
                const act = () => parseScript(script);
                // assert
                expect(act).to.throw(`unknown level: "${unknownLevel}"`);
            });
            it('throws on non-string type', () => {
                const nonStringTypes: any[] = [ 5, true ];
                nonStringTypes.forEach((nonStringType) => {
                    // arrange
                    const script = getValidScript();
                    script.recommend = nonStringType;
                    // act
                    const act = () => parseScript(script);
                    // assert
                    expect(act).to.throw(`level must be a string but it was ${typeof nonStringType}`);
                });
            });
            describe('parses level as expected', () => {
                for (const levelText of RecommendationLevelNames) {
                    it(levelText, () => {
                        // arrange
                        const expectedLevel = RecommendationLevel[levelText];
                        const script = getValidScript();
                        script.recommend = levelText;
                        // act
                        const actual = parseScript(script);
                        // assert
                        expect(actual.level).to.equal(expectedLevel);
                    });
                }
            });
            it('parses level case insensitive', () => {
                // arrange
                const script = getValidScript();
                const expected = RecommendationLevel.Standard;
                script.recommend = RecommendationLevel[expected].toUpperCase();
                // act
                const actual = parseScript(script);
                // assert
                expect(actual.level).to.equal(expected);
            });
        });
    });
});

function getValidScript(): YamlScript {
    return {
        name: 'valid-name',
        code: 'valid-code',
        revertCode: 'expected revert code',
        docs: ['hello.com'],
        recommend: RecommendationLevel[RecommendationLevel.Standard].toLowerCase(),
    };
}
