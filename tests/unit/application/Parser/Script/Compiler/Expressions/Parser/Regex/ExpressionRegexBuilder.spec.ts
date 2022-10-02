import 'mocha';
import { randomUUID } from 'crypto';
import { expect } from 'chai';
import { ExpressionRegexBuilder } from '@/application/Parser/Script/Compiler/Expressions/Parser/Regex/ExpressionRegexBuilder';

describe('ExpressionRegexBuilder', () => {
  describe('expectCharacters', () => {
    describe('escape single as expected', () => {
      const charactersToEscape = ['.', '$'];
      for (const character of charactersToEscape) {
        it(character, () => {
          expectRegex(
            // act
            (act) => act.expectCharacters(character),
            // assert
            `\\${character}`,
          );
        });
      }
    });
    it('escapes multiple as expected', () => {
      expectRegex(
        // act
        (act) => act.expectCharacters('.I have no $$.'),
        // assert
        '\\.I have no \\$\\$\\.',
      );
    });
    it('adds as expected', () => {
      expectRegex(
        // act
        (act) => act.expectCharacters('return as it is'),
        // assert
        'return as it is',
      );
    });
  });
  it('expectOneOrMoreWhitespaces', () => {
    expectRegex(
      // act
      (act) => act.expectOneOrMoreWhitespaces(),
      // assert
      '\\s+',
    );
  });
  it('matchPipeline', () => {
    expectRegex(
      // act
      (act) => act.matchPipeline(),
      // assert
      '\\s*(\\|\\s*.+?)?',
    );
  });
  it('matchUntilFirstWhitespace', () => {
    expectRegex(
      // act
      (act) => act.matchUntilFirstWhitespace(),
      // assert
      '([^|\\s]+)',
    );
    it('matches until first whitespace', () => expectMatch(
      // arrange
      'first second',
      // act
      (act) => act.matchUntilFirstWhitespace(),
      // assert
      'first',
    ));
  });
  describe('matchMultilineAnythingExceptSurroundingWhitespaces', () => {
    it('returns expected regex', () => expectRegex(
      // act
      (act) => act.matchMultilineAnythingExceptSurroundingWhitespaces(),
      // assert
      '\\s*([\\S\\s]+?)\\s*',
    ));
    it('matches single line', () => expectMatch(
      // arrange
      'single line',
      // act
      (act) => act.matchMultilineAnythingExceptSurroundingWhitespaces(),
      // assert
      'single line',
    ));
    it('matches single line without surrounding whitespaces', () => expectMatch(
      // arrange
      '  single line\t',
      // act
      (act) => act.matchMultilineAnythingExceptSurroundingWhitespaces(),
      // assert
      'single line',
    ));
    it('matches multiple lines', () => expectMatch(
      // arrange
      'first line\nsecond line',
      // act
      (act) => act.matchMultilineAnythingExceptSurroundingWhitespaces(),
      // assert
      'first line\nsecond line',
    ));
    it('matches multiple lines without surrounding whitespaces', () => expectMatch(
      // arrange
      '  first line\nsecond line\t',
      // act
      (act) => act.matchMultilineAnythingExceptSurroundingWhitespaces(),
      // assert
      'first line\nsecond line',
    ));
  });
  it('expectExpressionStart', () => {
    expectRegex(
      // act
      (act) => act.expectExpressionStart(),
      // assert
      '{{\\s*',
    );
  });
  it('expectExpressionEnd', () => {
    expectRegex(
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
        expectRegex(
          (sut) => sut
          // act
            // {{ with $variable }}
            .expectExpressionStart()
            .expectCharacters('with')
            .expectOneOrMoreWhitespaces()
            .expectCharacters('$')
            .matchUntilFirstWhitespace()
            .expectExpressionEnd()
            // scope
            .matchMultilineAnythingExceptSurroundingWhitespaces()
            // {{ end }}
            .expectExpressionStart()
            .expectCharacters('end')
            .expectExpressionEnd(),
          // assert
          '{{\\s*with\\s+\\$([^|\\s]+)\\s*}}\\s*([\\S\\s]+?)\\s*{{\\s*end\\s*}}',
        );
      });
      it('scoped substitution', () => {
        expectRegex(
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
        expectRegex(
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

function expectRegex(
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

function expectMatch(
  input: string,
  act: (sut: ExpressionRegexBuilder) => ExpressionRegexBuilder,
  expectedMatch: string,
) {
  // arrange
  const [startMarker, endMarker] = [randomUUID(), randomUUID()];
  const markedInput = `${startMarker}${input}${endMarker}`;
  const builder = new ExpressionRegexBuilder()
    .expectCharacters(startMarker);
  act(builder);
  const markedRegex = builder.expectCharacters(endMarker).buildRegExp();
  // act
  const match = Array.from(markedInput.matchAll(markedRegex))
    .filter((matches) => matches.length > 1)
    .map((matches) => matches[1])
    .filter(Boolean)
    .join();
  // assert
  expect(match).to.equal(expectedMatch);
}
