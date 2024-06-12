import { describe, it, expect } from 'vitest';
import { ExpressionRegexBuilder } from '@/application/Parser/Executable/Script/Compiler/Expressions/Parser/Regex/ExpressionRegexBuilder';

const AllWhitespaceCharacters = ' \t\n\r\v\f\u00A0';

describe('ExpressionRegexBuilder', () => {
  describe('expectCharacters', () => {
    describe('expectCharacters', () => {
      describe('escapes single character as expected', () => {
        const charactersToEscape = ['.', '$'];
        for (const character of charactersToEscape) {
          it(`escapes ${character} as expected`, () => expectMatch(
            character,
            (act) => act.expectCharacters(character),
            `${character}`,
          ));
        }
      });
      it('escapes multiple characters as expected', () => expectMatch(
        '.I have no $$.',
        (act) => act.expectCharacters('.I have no $$.'),
        '.I have no $$.',
      ));
      it('adds characters as expected', () => expectMatch(
        'return as it is',
        (act) => act.expectCharacters('return as it is'),
        'return as it is',
      ));
    });
  });
  describe('expectOneOrMoreWhitespaces', () => {
    it('matches one whitespace', () => expectMatch(
      ' ',
      (act) => act.expectOneOrMoreWhitespaces(),
      ' ',
    ));
    it('matches multiple whitespaces', () => expectMatch(
      AllWhitespaceCharacters,
      (act) => act.expectOneOrMoreWhitespaces(),
      AllWhitespaceCharacters,
    ));
    it('matches whitespaces inside text', () => expectMatch(
      `start${AllWhitespaceCharacters}end`,
      (act) => act.expectOneOrMoreWhitespaces(),
      AllWhitespaceCharacters,
    ));
    it('does not match non-whitespace characters', () => expectNonMatch(
      'a',
      (act) => act.expectOneOrMoreWhitespaces(),
    ));
  });
  describe('captureOptionalPipeline', () => {
    it('does not capture when no pipe is present', () => expectNonMatch(
      'noPipeHere',
      (act) => act.captureOptionalPipeline(),
    ));
    it('captures when input starts with pipe', () => expectCapture(
      '| afterPipe',
      (act) => act.captureOptionalPipeline(),
      '| afterPipe',
    ));
    it('ignores without text before', () => expectCapture(
      'stuff before | afterPipe',
      (act) => act.captureOptionalPipeline(),
      '| afterPipe',
    ));
    it('ignores without text before', () => expectCapture(
      'stuff before | afterPipe',
      (act) => act.captureOptionalPipeline(),
      '| afterPipe',
    ));
    it('ignores whitespaces before the pipe', () => expectCapture(
      '   | afterPipe',
      (act) => act.captureOptionalPipeline(),
      '| afterPipe',
    ));
    it('ignores text after whitespace', () => expectCapture(
      '| first Pipe',
      (act) => act.captureOptionalPipeline(),
      '| first ',
    ));
    describe('non-greedy matching', () => { // so the rest of the pattern can work
      it('non-letter character in pipe', () => expectCapture(
        '| firstPipe | sec0ndpipe',
        (act) => act.captureOptionalPipeline(),
        '| firstPipe ',
      ));
    });
  });
  describe('captureUntilWhitespaceOrPipe', () => {
    it('captures until first whitespace', () => expectCapture(
      // arrange
      'first ',
      // act
      (act) => act.captureUntilWhitespaceOrPipe(),
      // assert
      'first',
    ));
    it('captures until first pipe', () => expectCapture(
      // arrange
      'first|',
      // act
      (act) => act.captureUntilWhitespaceOrPipe(),
      // assert
      'first',
    ));
    it('captures all without whitespace or pipe', () => expectCapture(
      // arrange
      'all',
      // act
      (act) => act.captureUntilWhitespaceOrPipe(),
      // assert
      'all',
    ));
  });
  describe('captureMultilineAnythingExceptSurroundingWhitespaces', () => {
    describe('single line', () => {
      it('captures a line without surrounding whitespaces', () => expectCapture(
        // arrange
        'line',
        // act
        (act) => act.captureMultilineAnythingExceptSurroundingWhitespaces(),
        // assert
        'line',
      ));
      it('captures a line with internal whitespaces intact', () => expectCapture(
        `start${AllWhitespaceCharacters}end`,
        (act) => act.captureMultilineAnythingExceptSurroundingWhitespaces(),
        `start${AllWhitespaceCharacters}end`,
      ));
      it('excludes surrounding whitespaces', () => expectCapture(
        // arrange
        `${AllWhitespaceCharacters}single line\t`,
        // act
        (act) => act.captureMultilineAnythingExceptSurroundingWhitespaces(),
        // assert
        'single line',
      ));
    });
    describe('multiple lines', () => {
      it('captures text across multiple lines', () => expectCapture(
        // arrange
        'first line\nsecond line\r\nthird-line',
        // act
        (act) => act.captureMultilineAnythingExceptSurroundingWhitespaces(),
        // assert
        'first line\nsecond line\r\nthird-line',
      ));
      it('captures text with empty lines in between', () => expectCapture(
        'start\n\nend',
        (act) => act.captureMultilineAnythingExceptSurroundingWhitespaces(),
        'start\n\nend',
      ));
      it('excludes surrounding whitespaces from multiline text', () => expectCapture(
        // arrange
        `  first line\nsecond line${AllWhitespaceCharacters}`,
        // act
        (act) => act.captureMultilineAnythingExceptSurroundingWhitespaces(),
        // assert
        'first line\nsecond line',
      ));
    });
    describe('edge cases', () => {
      it('does not capture for input with only whitespaces', () => expectNonCapture(
        AllWhitespaceCharacters,
        (act) => act.captureMultilineAnythingExceptSurroundingWhitespaces(),
      ));
    });
  });
  describe('expectExpressionStart', () => {
    it('matches expression start without trailing whitespaces', () => expectMatch(
      '{{expression',
      (act) => act.expectExpressionStart(),
      '{{',
    ));
    it('matches expression start with trailing whitespaces', () => expectMatch(
      `{{${AllWhitespaceCharacters}expression`,
      (act) => act.expectExpressionStart(),
      `{{${AllWhitespaceCharacters}`,
    ));
    it('does not match whitespaces not directly after expression start', () => expectMatch(
      '   {{expression',
      (act) => act.expectExpressionStart(),
      '{{',
    ));
    it('does not match if expression start is not present', () => expectNonMatch(
      'noExpressionStartHere',
      (act) => act.expectExpressionStart(),
    ));
  });
  describe('expectExpressionEnd', () => {
    it('matches expression end without preceding whitespaces', () => expectMatch(
      'expression}}',
      (act) => act.expectExpressionEnd(),
      '}}',
    ));
    it('matches expression end with preceding whitespaces', () => expectMatch(
      `expression${AllWhitespaceCharacters}}}`,
      (act) => act.expectExpressionEnd(),
      `${AllWhitespaceCharacters}}}`,
    ));
    it('does not capture whitespaces not directly before expression end', () => expectMatch(
      'expression}}   ',
      (act) => act.expectExpressionEnd(),
      '}}',
    ));
    it('does not match if expression end is not present', () => expectNonMatch(
      'noExpressionEndHere',
      (act) => act.expectExpressionEnd(),
    ));
  });
  describe('expectOptionalWhitespaces', () => {
    describe('matching', () => {
      it('matches multiple Unix lines', () => expectMatch(
        // arrange
        '\n\n',
        // act
        (act) => act.expectOptionalWhitespaces(),
        // assert
        '\n\n',
      ));
      it('matches multiple Windows lines', () => expectMatch(
        // arrange
        '\r\n',
        // act
        (act) => act.expectOptionalWhitespaces(),
        // assert
        '\r\n',
      ));
      it('matches multiple spaces', () => expectMatch(
        // arrange
        '  ',
        // act
        (act) => act.expectOptionalWhitespaces(),
        // assert
        '  ',
      ));
      it('matches horizontal and vertical tabs', () => expectMatch(
        // arrange
        '\t\v',
        // act
        (act) => act.expectOptionalWhitespaces(),
        // assert
        '\t\v',
      ));
      it('matches form feed character', () => expectMatch(
        // arrange
        '\f',
        // act
        (act) => act.expectOptionalWhitespaces(),
        // assert
        '\f',
      ));
      it('matches a non-breaking space character', () => expectMatch(
        // arrange
        '\u00A0',
        // act
        (act) => act.expectOptionalWhitespaces(),
        // assert
        '\u00A0',
      ));
      it('matches a combination of whitespace characters', () => expectMatch(
        // arrange
        AllWhitespaceCharacters,
        // act
        (act) => act.expectOptionalWhitespaces(),
        // assert
        AllWhitespaceCharacters,
      ));
      it('matches whitespace characters on different positions', () => expectMatch(
        // arrange
        '\ta\nb\rc\v',
        // act
        (act) => act.expectOptionalWhitespaces(),
        // assert
        '\t\n\r\v',
      ));
    });
    describe('non-matching', () => {
      it('a non-whitespace character', () => expectNonMatch(
        // arrange
        'a',
        // act
        (act) => act.expectOptionalWhitespaces(),
      ));
      it('multiple non-whitespace characters', () => expectNonMatch(
        // arrange
        'abc',
        // act
        (act) => act.expectOptionalWhitespaces(),
      ));
    });
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
      it('combines character and whitespace expectations', () => expectMatch(
        'abc def',
        (act) => act
          .expectCharacters('abc')
          .expectOneOrMoreWhitespaces()
          .expectCharacters('def'),
        'abc def',
      ));
      it('captures optional pipeline and text after it', () => expectCapture(
        'abc | def',
        (act) => act
          .expectCharacters('abc ')
          .captureOptionalPipeline(),
        '| def',
      ));
      it('combines multiline capture with optional whitespaces', () => expectCapture(
        '\n  abc  \n',
        (act) => act
          .expectOptionalWhitespaces()
          .captureMultilineAnythingExceptSurroundingWhitespaces()
          .expectOptionalWhitespaces(),
        'abc',
      ));
      it('combines expression start, optional whitespaces, and character expectation', () => expectMatch(
        '{{ abc',
        (act) => act
          .expectExpressionStart()
          .expectOptionalWhitespaces()
          .expectCharacters('abc'),
        '{{ abc',
      ));
      it('combines character expectation, optional whitespaces, and expression end', () => expectMatch(
        'abc }}',
        (act) => act
          .expectCharacters('abc')
          .expectOptionalWhitespaces()
          .expectExpressionEnd(),
        'abc }}',
      ));
    });
  });
});

enum MatchGroupIndex {
  FullMatch = 0,
  FirstCapturingGroup = 1,
}

function expectCapture(
  input: string,
  act: (regexBuilder: ExpressionRegexBuilder) => ExpressionRegexBuilder,
  expectedCombinedCaptures: string | undefined,
): void {
  // arrange
  const matchGroupIndex = MatchGroupIndex.FirstCapturingGroup;
  // act
  // assert
  expectMatch(input, act, expectedCombinedCaptures, matchGroupIndex);
}

function expectNonMatch(
  input: string,
  act: (sut: ExpressionRegexBuilder) => ExpressionRegexBuilder,
  matchGroupIndex = MatchGroupIndex.FullMatch,
): void {
  expectMatch(input, act, undefined, matchGroupIndex);
}

function expectNonCapture(
  input: string,
  act: (sut: ExpressionRegexBuilder) => ExpressionRegexBuilder,
): void {
  expectNonMatch(input, act, MatchGroupIndex.FirstCapturingGroup);
}

function expectMatch(
  input: string,
  act: (regexBuilder: ExpressionRegexBuilder) => ExpressionRegexBuilder,
  expectedCombinedMatches: string | undefined,
  matchGroupIndex = MatchGroupIndex.FullMatch,
): void {
  // arrange
  const regexBuilder = new ExpressionRegexBuilder();
  act(regexBuilder);
  const regex = regexBuilder.buildRegExp();
  // act
  const allMatchGroups = Array.from(input.matchAll(regex));
  // assert
  const actualMatches = allMatchGroups
    .filter((matches) => matches.length > matchGroupIndex)
    .map((matches) => matches[matchGroupIndex])
    .filter(Boolean) // matchAll returns `""` for full matches, `null` for capture groups
    .flat();
  const actualCombinedMatches = actualMatches.length ? actualMatches.join('') : undefined;
  expect(actualCombinedMatches).equal(
    expectedCombinedMatches,
    [
      '\n\n---',
      'Expected combined matches:',
      getTestDataText(expectedCombinedMatches),
      'Actual combined matches:',
      getTestDataText(actualCombinedMatches),
      'Input:',
      getTestDataText(input),
      'Regex:',
      getTestDataText(regex.toString()),
      'All match groups:',
      getTestDataText(JSON.stringify(allMatchGroups)),
      `Match index in group: ${matchGroupIndex}`,
      '---\n\n',
    ].join('\n'),
  );
}

function getTestDataText(data: string | undefined): string {
  const outputPrefix = '\t> ';
  if (data === undefined) {
    return `${outputPrefix}undefined (no matches)`;
  }
  const getLiteralString = (text: string) => JSON.stringify(text).slice(1, -1);
  const text = `${outputPrefix}\`${getLiteralString(data)}\``;
  return text;
}
