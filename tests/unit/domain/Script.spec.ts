import { describe, it, expect } from 'vitest';
import { getEnumValues } from '@/application/Common/Enum';
import { Script } from '@/domain/Script';
import { RecommendationLevel } from '@/domain/RecommendationLevel';
import { IScriptCode } from '@/domain/IScriptCode';
import { ScriptCodeStub } from '@tests/unit/shared/Stubs/ScriptCodeStub';
import { itEachAbsentObjectValue } from '@tests/unit/shared/TestCases/AbsentTests';

describe('Script', () => {
  describe('ctor', () => {
    describe('scriptCode', () => {
      it('sets as expected', () => {
        // arrange
        const expected = new ScriptCodeStub();
        const sut = new ScriptBuilder()
          .withCode(expected)
          .build();
        // act
        const actual = sut.code;
        // assert
        expect(actual).to.deep.equal(expected);
      });
      describe('throws when missing', () => {
        itEachAbsentObjectValue((absentValue) => {
          // arrange
          const expectedError = 'missing code';
          const code: IScriptCode = absentValue;
          // act
          const construct = () => new ScriptBuilder()
            .withCode(code)
            .build();
          // assert
          expect(construct).to.throw(expectedError);
        });
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
    describe('docs', () => {
      it('sets as expected', () => {
        // arrange
        const expected = ['doc1', 'doc2'];
        // act
        const sut = new ScriptBuilder()
          .withDocs(expected)
          .build();
        const actual = sut.docs;
        // assert
        expect(actual).to.equal(expected);
      });
    });
  });
});

class ScriptBuilder {
  private name = 'test-script';

  private code: IScriptCode = new ScriptCodeStub();

  private level = RecommendationLevel.Standard;

  private docs: readonly string[] = undefined;

  public withCodes(code: string, revertCode = ''): ScriptBuilder {
    this.code = new ScriptCodeStub()
      .withExecute(code)
      .withRevert(revertCode);
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

  public withDocs(urls: readonly string[]): ScriptBuilder {
    this.docs = urls;
    return this;
  }

  public build(): Script {
    return new Script(
      this.name,
      this.code,
      this.docs,
      this.level,
    );
  }
}
