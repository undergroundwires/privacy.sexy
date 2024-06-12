import { describe, it, expect } from 'vitest';
import { getEnumValues } from '@/application/Common/Enum';
import { CollectionScript } from '@/domain/Executables/Script/CollectionScript';
import { RecommendationLevel } from '@/domain/Executables/Script/RecommendationLevel';
import type { ScriptCode } from '@/domain/Executables/Script/Code/ScriptCode';
import { ScriptCodeStub } from '@tests/unit/shared/Stubs/ScriptCodeStub';

describe('CollectionScript', () => {
  describe('ctor', () => {
    describe('scriptCode', () => {
      it('assigns code correctly', () => {
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
      it('throws when constructed with invalid level', () => {
        // arrange
        const invalidValue: RecommendationLevel = 55 as never;
        const expectedError = 'invalid level';
        // act
        const construct = () => new ScriptBuilder()
          .withRecommendationLevel(invalidValue)
          .build();
        // assert
        expect(construct).to.throw(expectedError);
      });
      it('handles undefined level correctly', () => {
        // arrange
        const expected = undefined;
        // act
        const sut = new ScriptBuilder()
          .withRecommendationLevel(expected)
          .build();
        // assert
        expect(sut.level).to.equal(expected);
      });
      it('correctly assigns valid recommendation levels', () => {
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
      it('correctly assigns docs', () => {
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

  private code: ScriptCode = new ScriptCodeStub();

  private level? = RecommendationLevel.Standard;

  private docs: readonly string[] = [];

  public withCodes(code: string, revertCode = ''): this {
    this.code = new ScriptCodeStub()
      .withExecute(code)
      .withRevert(revertCode);
    return this;
  }

  public withCode(code: ScriptCode): this {
    this.code = code;
    return this;
  }

  public withName(name: string): this {
    this.name = name;
    return this;
  }

  public withRecommendationLevel(level: RecommendationLevel | undefined): this {
    this.level = level;
    return this;
  }

  public withDocs(docs: readonly string[]): this {
    this.docs = docs;
    return this;
  }

  public build(): CollectionScript {
    return new CollectionScript({
      name: this.name,
      code: this.code,
      docs: this.docs,
      level: this.level,
    });
  }
}
