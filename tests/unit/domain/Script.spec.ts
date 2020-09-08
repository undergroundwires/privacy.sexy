import { getEnumValues } from '@/application/Common/Enum';
import 'mocha';
import { expect } from 'chai';
import { Script } from '@/domain/Script';
import { RecommendationLevel } from '@/domain/RecommendationLevel';
import { ScriptCode } from '@/domain/ScriptCode';
import { IScriptCode } from '@/domain/IScriptCode';

describe('Script', () => {
    describe('ctor', () => {
        describe('scriptCode', () => {
            it('sets as expected', () => {
                // arrange
                const name = 'test-script';
                const expected = new ScriptCode(name, 'expected-execute', 'expected-revert');
                const sut = new ScriptBuilder()
                    .withCode(expected)
                    .build();
                // act
                const actual = sut.code;
                // assert
                expect(actual).to.deep.equal(expected);
            });
            it('throws if undefined', () => {
                // arrange
                const name = 'script-name';
                const expectedError = `undefined code (script: ${name})`;
                const code: IScriptCode = undefined;
                // act
                const construct = () => new ScriptBuilder()
                    .withName(name)
                    .withCode(code)
                    .build();
                // assert
                expect(construct).to.throw(expectedError);
            });
        });
        describe('canRevert', () => {
            it('returns false without revert code', () => {
                // arrange
                const sut = new ScriptBuilder()
                    .withCodes('code')
                    .build();
                // act
                const actual = sut.canRevert();
                // assert
                expect(actual).to.equal(false);
            });
            it('returns true with revert code', () => {
                // arrange
                const sut = new ScriptBuilder()
                    .withCodes('code', 'non empty revert code')
                    .build();
                // act
                const actual = sut.canRevert();
                // assert
                expect(actual).to.equal(true);
            });
        });
        describe('level', () => {
            it('cannot construct with invalid wrong value', () => {
                // arrange
                const invalidValue: RecommendationLevel = 55;
                const expectedError = 'invalid level';
                // act
                const construct = () => new ScriptBuilder()
                    .withRecommendationLevel(invalidValue)
                    .build();
                // assert
                expect(construct).to.throw(expectedError);
            });
            it('sets undefined as expected', () => {
                // arrange
                const expected = undefined;
                // act
                const sut = new ScriptBuilder()
                    .withRecommendationLevel(expected)
                    .build();
                // assert
                expect(sut.level).to.equal(expected);
            });
            it('sets as expected', () => {
                // arrange
                for (const expected of getEnumValues(RecommendationLevel)) {
                    // act
                    const sut = new ScriptBuilder()
                        .withRecommendationLevel(expected)
                        .build();
                    // assert
                    const actual = sut.level;
                    expect(actual).to.equal(expected);
                }
            });
        });
        describe('documentationUrls', () => {
            it('sets as expected', () => {
                // arrange
                const expected = [ 'doc1', 'doc2 '];
                // act
                const sut = new ScriptBuilder()
                    .withDocumentationUrls(expected)
                    .build();
                const actual = sut.documentationUrls;
                // assert
                expect(actual).to.equal(expected);
            });
        });
    });
});

class ScriptBuilder {
    private name = 'test-script';
    private code: IScriptCode = new ScriptCode(this.name, 'code', 'revert-code');
    private level = RecommendationLevel.Standard;
    private documentationUrls: readonly string[] = undefined;

    public withCodes(code: string, revertCode = ''): ScriptBuilder {
        this.code = new ScriptCode(this.name, code, revertCode);
        return this;
    }

    public withCode(code: IScriptCode): ScriptBuilder {
        this.code = code;
        return this;
    }

    public withName(name: string): ScriptBuilder {
        this.name = name;
        return this;
    }

    public withRecommendationLevel(level: RecommendationLevel): ScriptBuilder {
        this.level = level;
        return this;
    }

    public withDocumentationUrls(urls: readonly string[]): ScriptBuilder {
        this.documentationUrls = urls;
        return this;
    }

    public build(): Script {
        return new Script(
            this.name,
            this.code,
            this.documentationUrls,
            this.level,
        );
    }
}
