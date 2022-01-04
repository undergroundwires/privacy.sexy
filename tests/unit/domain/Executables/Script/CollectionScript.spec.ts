import { describe, it, expect } from 'vitest';
import { getEnumValues } from '@/application/Common/Enum';
import { CollectionScript } from '@/domain/Executables/Script/CollectionScript';
import { RecommendationLevel } from '@/domain/Executables/Script/RecommendationLevel';
import { ScriptCode } from '@/domain/Executables/Script/Code/ScriptCode';
import { ScriptCodeStub } from '@tests/unit/shared/Stubs/ScriptCodeStub';
import { itEachAbsentStringValue } from '@tests/unit/shared/TestCases/AbsentTests';

describe('CollectionScript', () => {
  describe('ctor', () => {
    describe('id', () => {
      it('sets as expected', () => {
        // arrange
        const expected = '3e172d73';
        const sut = new ScriptBuilder()
          .withId(expected)
          .build();
        // act
        const actual = sut.executableId;
        // assert
        expect(actual).to.deep.equal(expected);
      });
      describe('throws when missing', () => {
        itEachAbsentStringValue((absentValue) => {
          // arrange
          const expectedError = 'missing ID';
          const id = absentValue;
          // act
          const construct = () => new ScriptBuilder()
            .withId(id)
            .build();
          // assert
          expect(construct).to.throw(expectedError);
        }, { excludeNull: true, excludeUndefined: true });
      });
      describe('throws when not partial UUID', () => {
        const badPartialUuidValues = [
          '25f48eb1-d77f-44c4-9abd-87a9bf18ac4d', // Full GUID
          '1234567', // boundary test: 7 characters
          '123456789', //  boundary test: 9 characters
        ];
        badPartialUuidValues.forEach((badUuid) => {
          it(`given ${badUuid}`, () => {
            // arrange
            const scriptName = 'script-with-bad-id';
            const expectedError = `ID ("${badUuid}") is not a valid partial UUID (script: ${scriptName})`;
            // act
            const act = () => new ScriptBuilder()
              .withName(scriptName)
              .withId(badUuid)
              .build();
            // assert
            expect(act).to.throw(expectedError);
          });
        });
      });
    });
    describe('name', () => {
      it('sets as expected', () => {
        // arrange
        const expected = 'Disable some telemetry';
        const sut = new ScriptBuilder()
          .withName(expected)
          .build();
        // act
        const actual = sut.name;
        // assert
        expect(actual).to.deep.equal(expected);
      });
      describe('throws when missing', () => {
        itEachAbsentStringValue((absentValue) => {
          // arrange
          const expectedError = 'missing name';
          const name = absentValue;
          // act
          const construct = () => new ScriptBuilder()
            .withName(name)
            .build();
          // assert
          expect(construct).to.throw(expectedError);
        }, { excludeUndefined: true, excludeNull: true });
      });
    });
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
        const invalidValue: RecommendationLevel = 55 as never;
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

  private code: ScriptCode = new ScriptCodeStub();

  private level? = RecommendationLevel.Standard;

  private docs: readonly string[] = [];

  private id = 'cda7a415';

  public withCodes(code: string, revertCode = ''): ScriptBuilder {
    this.code = new ScriptCodeStub()
      .withExecute(code)
      .withRevert(revertCode);
    return this;
  }

  public withId(id: string) {
    this.id = id;
    return this;
  }

  public withCode(code: ScriptCode): ScriptBuilder {
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
    return new CollectionScript(
      this.id,
      this.name,
      this.code,
      this.docs,
      this.level,
    );
  }
}
