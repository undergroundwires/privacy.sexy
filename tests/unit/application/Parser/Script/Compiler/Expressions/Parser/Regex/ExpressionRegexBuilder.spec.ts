import 'mocha';
import { expect } from 'chai';
import { ExpressionRegexBuilder } from '@/application/Parser/Script/Compiler/Expressions/Parser/Regex/ExpressionRegexBuilder';

describe('ExpressionRegexBuilder', () => {
  describe('expectCharacters', () => {
    describe('escape single as expected', () => {
      const charactersToEscape = ['.', '$'];
      for (const character of charactersToEscape) {
        it(character, () => {
          runRegExTest(
            // act
            (act) => act.expectCharacters(character),
            // assert
            `\\${character}`,
          );
        });
      }
    });
    it('escapes multiple as expected', () => {
      runRegExTest(
        // act
        (act) => act.expectCharacters('.I have no $$.'),
        // assert
        '\\.I have no \\$\\$\\.',
      );
    });
    it('adds as expected', () => {
      runRegExTest(
        // act
        (act) => act.expectCharacters('return as it is'),
        // assert
        'return as it is',
      );
    });
  });
  it('expectOneOrMoreWhitespaces', () => {
    runRegExTest(
      // act
      (act) => act.expectOneOrMoreWhitespaces(),
      // assert
      '\\s+',
    );
  });
  it('matchPipeline', () => {
    runRegExTest(
      // act
      (act) => act.matchPipeline(),
      // assert
      '\\s*(\\|\\s*.+?)?',
    );
  });
  it('matchUntilFirstWhitespace', () => {
    runRegExTest(
      // act
      (act) => act.matchUntilFirstWhitespace(),
      // assert
      '([^|\\s]+)',
    );
  });
  it('matchAnythingExceptSurroundingWhitespaces', () => {
    runRegExTest(
      // act
      (act) => act.matchAnythingExceptSurroundingWhitespaces(),
      // assert
      '\\s*(.+?)\\s*',
    );
  });
  it('expectExpressionStart', () => {
    runRegExTest(
      // act
      (act) => act.expectExpressionStart(),
      // assert
      '{{\\s*',
    );
  });
  it('expectExpressionEnd', () => {
    runRegExTest(
      // act
      (act) => act.expectExpressionEnd(),
      // assert
      '\\s*}}',
    );
  });
  describe('buildRegExp', () => {
    it('sets global flag', () => {
      // arrange
      const expected = 'g';
      const sut = new ExpressionRegexBuilder()
        .expectOneOrMoreWhitespaces();
      // act
      const actual = sut.buildRegExp().flags;
      // assert
      expect(actual).to.equal(expected);
    });
    describe('can combine multiple parts', () => {
      it('with', () => {
        runRegExTest(
          (sut) => sut
          // act
            // {{ $with }}
            .expectExpressionStart()
            .expectCharacters('with')
            .expectOneOrMoreWhitespaces()
            .expectCharacters('$')
            .matchUntilFirstWhitespace()
            .expectExpressionEnd()
            // scope
            .matchAnythingExceptSurroundingWhitespaces()
            // {{ end }}
            .expectExpressionStart()
            .expectCharacters('end')
            .expectExpressionEnd(),
          // assert
          '{{\\s*with\\s+\\$([^|\\s]+)\\s*}}\\s*(.+?)\\s*{{\\s*end\\s*}}',
        );
      });
      it('scoped substitution', () => {
        runRegExTest(
          (sut) => sut
          // act
            .expectExpressionStart().expectCharacters('.')
            .matchPipeline()
            .expectExpressionEnd(),
          // assert
          '{{\\s*\\.\\s*(\\|\\s*.+?)?\\s*}}',
        );
      });
      it('parameter substitution', () => {
        runRegExTest(
          (sut) => sut
          // act
            .expectExpressionStart().expectCharacters('$')
            .matchUntilFirstWhitespace()
            .matchPipeline()
            .expectExpressionEnd(),
          // assert
          '{{\\s*\\$([^|\\s]+)\\s*(\\|\\s*.+?)?\\s*}}',
        );
      });
    });
  });
});

function runRegExTest(
  act: (sut: ExpressionRegexBuilder) => ExpressionRegexBuilder,
  expected: string,
) {
  // arrange
  const sut = new ExpressionRegexBuilder();
  // act
  const actual = act(sut).buildRegExp().source;
  // assert
  expect(actual).to.equal(expected);
}
