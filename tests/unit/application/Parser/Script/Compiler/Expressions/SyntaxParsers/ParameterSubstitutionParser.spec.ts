import { describe } from 'vitest';
import { ParameterSubstitutionParser } from '@/application/Parser/Script/Compiler/Expressions/SyntaxParsers/ParameterSubstitutionParser';
import { ExpressionPosition } from '@/application/Parser/Script/Compiler/Expressions/Expression/ExpressionPosition';
import { SyntaxParserTestsRunner } from './SyntaxParserTestsRunner';

describe('ParameterSubstitutionParser', () => {
  const sut = new ParameterSubstitutionParser();
  const runner = new SyntaxParserTestsRunner(sut);
  describe('finds as expected', () => {
    runner.expectPosition(
      {
        name: 'single parameter',
        code: '{{ $parameter }}!',
        expected: [new ExpressionPosition(0, 16)],
      },
      {
        name: 'different parameters',
        code: 'He{{ $firstParameter }} {{ $secondParameter }}!!',
        expected: [new ExpressionPosition(2, 23), new ExpressionPosition(24, 46)],
      },
      {
        name: 'tolerates lack of spaces around brackets',
        code: 'He{{$firstParameter}}!!',
        expected: [new ExpressionPosition(2, 21)],
      },
      {
        name: 'does not tolerate space after dollar sign',
        code: 'He{{ $ firstParameter }}!!',
        expected: [],
      },
    );
  });
  describe('evaluates as expected', () => {
    runner.expectResults(
      {
        name: 'single parameter',
        code: '{{ $parameter }}',
        args: (args) => args
          .withArgument('parameter', 'Hello world'),
        expected: ['Hello world'],
      },
      {
        name: 'different parameters',
        code: '{{ $firstParameter }} {{ $secondParameter }}!',
        args: (args) => args
          .withArgument('firstParameter', 'Hello')
          .withArgument('secondParameter', 'World'),
        expected: ['Hello', 'World'],
      },
      {
        name: 'same parameters used twice',
        code: '{{ $letterH }}e{{ $letterL }}{{ $letterL }}o Wor{{ $letterL }}d!',
        args: (args) => args
          .withArgument('letterL', 'l')
          .withArgument('letterH', 'H'),
        expected: ['H', 'l', 'l', 'l'],
      },
    );
  });
  describe('compiles pipes as expected', () => {
    runner.expectPipeHits({
      codeBuilder: (pipeline) => `{{ $argument${pipeline}}}`,
      parameterName: 'argument',
      parameterValue: 'value',
    });
  });
});
