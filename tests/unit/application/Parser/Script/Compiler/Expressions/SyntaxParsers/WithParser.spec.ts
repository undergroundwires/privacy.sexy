import { describe } from 'vitest';
import { ExpressionPosition } from '@/application/Parser/Script/Compiler/Expressions/Expression/ExpressionPosition';
import { WithParser } from '@/application/Parser/Script/Compiler/Expressions/SyntaxParsers/WithParser';
import { getAbsentStringTestCases } from '@tests/unit/shared/TestCases/AbsentTests';
import { SyntaxParserTestsRunner } from './SyntaxParserTestsRunner';

describe('WithParser', () => {
  const sut = new WithParser();
  const runner = new SyntaxParserTestsRunner(sut);
  describe('finds as expected', () => {
    runner.expectPosition(
      {
        name: 'when no scope is not used',
        code: 'hello {{ with $parameter }}no usage{{ end }} here',
        expected: [new ExpressionPosition(6, 44)],
      },
      {
        name: 'when scope is used',
        code: 'used here ({{ with $parameter }}value: {{.}}{{ end }})',
        expected: [new ExpressionPosition(11, 53)],
      },
      {
        name: 'when used twice',
        code: 'first: {{ with $parameter }}value: {{ . }}{{ end }}, second: {{ with $parameter }}no usage{{ end }}',
        expected: [new ExpressionPosition(7, 51), new ExpressionPosition(61, 99)],
      },
      {
        name: 'tolerate lack of whitespaces',
        code: 'no whitespaces {{with $parameter}}value: {{ . }}{{end}}',
        expected: [new ExpressionPosition(15, 55)],
      },
      {
        name: 'match multiline text',
        code: 'non related line\n{{ with $middleLine }}\nline before value\n{{ . }}\nline after value\n{{ end }}\nnon related line',
        expected: [new ExpressionPosition(17, 92)],
      },
    );
  });
  describe('ignores when syntax is wrong', () => {
    describe('ignores expression if "with" syntax is wrong', () => {
      runner.expectNoMatch(
        {
          name: 'does not tolerate whitespace after with',
          code: '{{with $ parameter}}value: {{ . }}{{ end }}',
        },
        {
          name: 'does not tolerate whitespace before dollar',
          code: '{{ with$parameter}}value: {{ . }}{{ end }}',
        },
        {
          name: 'wrong text at scope end',
          code: '{{ with$parameter}}value: {{ . }}{{ fin }}',
        },
        {
          name: 'wrong text at expression start',
          code: '{{ when $parameter}}value: {{ . }}{{ end }}',
        },
      );
    });
    describe('does not render argument if substitution syntax is wrong', () => {
      runner.expectResults(
        {
          name: 'comma used instead of dot',
          code: '{{ with $parameter }}Hello {{ , }}{{ end }}',
          args: (args) => args
            .withArgument('parameter', 'world!'),
          expected: ['Hello {{ , }}'],
        },
        {
          name: 'single brackets instead of double',
          code: '{{ with $parameter }}Hello { . }{{ end }}',
          args: (args) => args
            .withArgument('parameter', 'world!'),
          expected: ['Hello { . }'],
        },
        {
          name: 'double dots instead of single',
          code: '{{ with $parameter }}Hello {{ .. }}{{ end }}',
          args: (args) => args
            .withArgument('parameter', 'world!'),
          expected: ['Hello {{ .. }}'],
        },
      );
    });
  });
  describe('renders scope conditionally', () => {
    describe('does not render scope if argument is undefined', () => {
      runner.expectResults(
        ...getAbsentStringTestCases().map((testCase) => ({
          name: `does not render when value is "${testCase.valueName}"`,
          code: '{{ with $parameter }}dark{{ end }} ',
          args: (args) => args
            .withArgument('parameter', testCase.absentValue),
          expected: [''],
        })),
        {
          name: 'does not render when argument is not provided',
          code: '{{ with $parameter }}dark{{ end }}',
          args: (args) => args,
          expected: [''],
        },
      );
    });
    describe('render scope when variable has value', () => {
      runner.expectResults(
        {
          name: 'renders scope even if value is not used',
          code: '{{ with $parameter }}Hello world!{{ end }}',
          args: (args) => args
            .withArgument('parameter', 'Hello'),
          expected: ['Hello world!'],
        },
        {
          name: 'renders value when it has value',
          code: '{{ with $parameter }}{{ . }} world!{{ end }}',
          args: (args) => args
            .withArgument('parameter', 'Hello'),
          expected: ['Hello world!'],
        },
        {
          name: 'renders value when whitespaces around brackets are missing',
          code: '{{ with $parameter }}{{.}} world!{{ end }}',
          args: (args) => args
            .withArgument('parameter', 'Hello'),
          expected: ['Hello world!'],
        },
        {
          name: 'renders value multiple times when it\'s used multiple times',
          code: '{{ with $letterL }}He{{ . }}{{ . }}o wor{{ . }}d!{{ end }}',
          args: (args) => args
            .withArgument('letterL', 'l'),
          expected: ['Hello world!'],
        },
        {
          name: 'renders value in multi-lined text',
          code: '{{ with $middleLine }}line before value\n{{ . }}\nline after value{{ end }}',
          args: (args) => args
            .withArgument('middleLine', 'value line'),
          expected: ['line before value\nvalue line\nline after value'],
        },
        {
          name: 'renders value around whitespaces in multi-lined text',
          code: '{{ with $middleLine }}\nline before value\n{{ . }}\nline after value\t {{ end }}',
          args: (args) => args
            .withArgument('middleLine', 'value line'),
          expected: ['line before value\nvalue line\nline after value'],
        },
      );
    });
  });
  describe('ignores trailing and leading whitespaces and newlines inside scope', () => {
    runner.expectResults(
      {
        name: 'does not render trailing whitespace after value',
        code: '{{ with $parameter }}{{ . }}! {{ end }}',
        args: (args) => args
          .withArgument('parameter', 'Hello world'),
        expected: ['Hello world!'],
      },
      {
        name: 'does not render trailing newline after value',
        code: '{{ with $parameter }}{{ . }}!\r\n{{ end }}',
        args: (args) => args
          .withArgument('parameter', 'Hello world'),
        expected: ['Hello world!'],
      },
      {
        name: 'does not render leading newline before value',
        code: '{{ with $parameter }}\r\n{{ . }}!{{ end }}',
        args: (args) => args
          .withArgument('parameter', 'Hello world'),
        expected: ['Hello world!'],
      },
      {
        name: 'does not render leading whitespace before value',
        code: '{{ with $parameter }}  {{ . }}!{{ end }}',
        args: (args) => args
          .withArgument('parameter', 'Hello world'),
        expected: ['Hello world!'],
      },
    );
  });
  describe('compiles pipes in scope as expected', () => {
    runner.expectPipeHits({
      codeBuilder: (pipeline) => `{{ with $argument }} {{ .${pipeline}}} {{ end }}`,
      parameterName: 'argument',
      parameterValue: 'value',
    });
  });
});
