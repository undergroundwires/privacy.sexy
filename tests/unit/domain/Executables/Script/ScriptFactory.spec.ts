import { describe, it, expect } from 'vitest';
import { getEnumValues } from '@/application/Common/Enum';
import { RecommendationLevel } from '@/domain/Executables/Script/RecommendationLevel';
import type { ScriptCode } from '@/domain/Executables/Script/Code/ScriptCode';
import { ScriptCodeStub } from '@tests/unit/shared/Stubs/ScriptCodeStub';
import { createScript } from '@/domain/Executables/Script/ScriptFactory';
import type { ExecutableId } from '@/domain/Executables/Identifiable/Identifiable';

describe('ScriptFactory', () => {
  describe('createScript', () => {
    describe('id', () => {
      it('correctly assigns id', () => {
        // arrange
        const expectedId: ExecutableId = 'expected-id';
        // act
        const script = new TestContext()
          .withId(expectedId)
          .build();
        // assert
        const actualId = script.executableId;
        expect(actualId).to.equal(expectedId);
      });
    });
    describe('scriptCode', () => {
      it('assigns code correctly', () => {
        // arrange
        const expected = new ScriptCodeStub();
        const script = new TestContext()
          .withCode(expected)
          .build();
        // act
        const actual = script.code;
        // assert
        expect(actual).to.deep.equal(expected);
      });
    });
    describe('canRevert', () => {
      it('returns false without revert code', () => {
        // arrange
        const script = new TestContext()
          .withCodes('code')
          .build();
        // act
        const actual = script.canRevert();
        // assert
        expect(actual).to.equal(false);
      });
      it('returns true with revert code', () => {
        // arrange
        const script = new TestContext()
          .withCodes('code', 'non empty revert code')
          .build();
        // act
        const actual = script.canRevert();
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
        const construct = () => new TestContext()
          .withRecommendationLevel(invalidValue)
          .build();
        // assert
        expect(construct).to.throw(expectedError);
      });
      it('handles undefined level correctly', () => {
        // arrange
        const expected = undefined;
        // act
        const script = new TestContext()
          .withRecommendationLevel(expected)
          .build();
        // assert
        expect(script.level).to.equal(expected);
      });
      it('correctly assigns valid recommendation levels', () => {
        getEnumValues(RecommendationLevel).forEach((enumValue) => {
          // arrange
          const expectedRecommendationLevel = enumValue;
          // act
          const script = new TestContext()
            .withRecommendationLevel(expectedRecommendationLevel)
            .build();
          // assert
          const actualRecommendationLevel = script.level;
          expect(actualRecommendationLevel).to.equal(expectedRecommendationLevel);
        });
      });
    });
    describe('docs', () => {
      it('correctly assigns docs', () => {
        // arrange
        const expectedDocs = ['doc1', 'doc2'];
        // act
        const script = new TestContext()
          .withDocs(expectedDocs)
          .build();
        // assert
        const actualDocs = script.docs;
        expect(actualDocs).to.equal(expectedDocs);
      });
    });
  });
});

class TestContext {
  private name = `[${TestContext.name}]test-script`;

  private id: ExecutableId = `[${TestContext.name}]id`;

  private code: ScriptCode = new ScriptCodeStub();

  private level? = RecommendationLevel.Standard;

  private docs: readonly string[] = [];

  public withCodes(code: string, revertCode = ''): this {
    this.code = new ScriptCodeStub()
      .withExecute(code)
      .withRevert(revertCode);
    return this;
  }

  public withId(id: ExecutableId): this {
    this.id = id;
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

  public build(): ReturnType<typeof createScript> {
    return createScript({
      executableId: this.id,
      name: this.name,
      code: this.code,
      docs: this.docs,
      level: this.level,
    });
  }
}
