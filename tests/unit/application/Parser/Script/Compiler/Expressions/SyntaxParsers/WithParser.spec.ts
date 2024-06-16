import { describe } from 'vitest';
import { ExpressionPosition } from '@/application/Parser/Script/Compiler/Expressions/Expression/ExpressionPosition';
import { WithParser } from '@/application/Parser/Script/Compiler/Expressions/SyntaxParsers/WithParser';
import { getAbsentStringTestCases } from '@tests/unit/shared/TestCases/AbsentTests';
import { SyntaxParserTestsRunner } from './SyntaxParserTestsRunner';

describe('WithParser', () => {
  const sut = new WithParser();
  const runner = new SyntaxParserTestsRunner(sut);
  describe('correctly identifies `with` syntax', () => {
    runner.expectPosition(
      {
        name: 'when no context variable is not used',
        code: 'hello {{ with $parameter }}no usage{{ end }} here',
        expected: [new ExpressionPosition(6, 44)],
      },
      {
        name: 'when context variable is used',
        code: 'used here ({{ with $parameter }}value: {{.}}{{ end }})',
        expected: [new ExpressionPosition(11, 53)],
      },
      {
        name: 'when used twice',
        code: 'first: {{ with $parameter }}value: {{ . }}{{ end }}, second: {{ with $parameter }}no usage{{ end }}',
        expected: [new ExpressionPosition(7, 51), new ExpressionPosition(61, 99)],
      },
      {
        name: 'when nested',
        code: 'outer: {{ with $outer }}outer value with context variable: {{ . }}, inner: {{ with $inner }}inner value{{ end }}.{{ end }}',
        expected: [
          /* outer: */ new ExpressionPosition(7, 122),
          /* inner: */ new ExpressionPosition(77, 112),
        ],
      },
      {
        name: 'whitespaces: tolerate lack of whitespaces',
        code: 'no whitespaces {{with $parameter}}value: {{ . }}{{end}}',
        expected: [new ExpressionPosition(15, 55)],
      },
      {
        name: 'newlines: match multiline text',
        code: 'non related line\n{{ with $middleLine }}\nline before value\n{{ . }}\nline after value\n{{ end }}\nnon related line',
        expected: [new ExpressionPosition(17, 92)],
      },
      {
        name: 'newlines: does not match newlines before',
        code: '\n{{ with $unimportant }}Text{{ end }}',
        expected: [new ExpressionPosition(1, 37)],
      },
      {
        name: 'newlines: does not match newlines after',
        code: '{{ with $unimportant }}Text{{ end }}\n',
        expected: [new ExpressionPosition(0, 36)],
      },
    );
  });
  describe('throws with incorrect `with` syntax', () => {
    runner.expectThrows(
      {
        name: 'incorrect `with`: whitespace after dollar sign inside `with` statement',
        code: '{{with $ parameter}}value: {{ . }}{{ end }}',
        expectedError: 'Context variable before `with` statement.',
      },
      {
        name: 'incorrect `with`: whitespace before dollar sign inside `with` statement',
        code: '{{ with$parameter}}value: {{ . }}{{ end }}',
        expectedError: 'Context variable before `with` statement.',
      },
      {
        name: 'incorrect `with`: missing `with` statement',
        code: '{{ when $parameter}}value: {{ . }}{{ end }}',
        expectedError: 'Context variable before `with` statement.',
      },
      {
        name: 'incorrect `end`: missing `end` statement',
        code: '{{ with $parameter}}value: {{ . }}{{ fin }}',
        expectedError: 'Missing `end` statement, forgot `{{ end }}?',
      },
      {
        name: 'incorrect `end`: used without `with`',
        code: 'Value {{ end }}',
        expectedError: 'Redundant `end` statement, missing `with`?',
      },
      {
        name: 'incorrect "context variable": used without `with`',
        code: 'Value: {{ . }}',
        expectedError: 'Context variable before `with` statement.',
      },
    );
  });
  describe('ignores when syntax is wrong', () => {
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
  describe('scope rendering', () => {
    describe('conditional rendering based on argument value', () => {
      describe('does not render scope', () => {
        runner.expectResults(
          ...getAbsentStringTestCases({ excludeNull: true, excludeUndefined: true })
            .map((testCase) => ({
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
      describe('renders scope', () => {
        runner.expectResults(
          ...getAbsentStringTestCases({ excludeNull: true, excludeUndefined: true })
            .map((testCase) => ({
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
        );
      });
    });
    describe('whitespace handling inside scope', () => {
      runner.expectResults(
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
          name: 'does not render leading whitespaces before value',
          code: '{{ with $parameter }}  {{ . }}!{{ end }}',
          args: (args) => args
            .withArgument('parameter', 'Hello world'),
          expected: ['Hello world!'],
        },
        {
          name: 'does not render leading newline and whitespaces before value',
          code: '{{ with $parameter }}\r\n  {{ . }}!{{ end }}',
          args: (args) => args
            .withArgument('parameter', 'Hello world'),
          expected: ['Hello world!'],
        },
      );
    });
    describe('nested with statements', () => {
      runner.expectResults(
        {
          name: 'renders nested with statements correctly',
          code: '{{ with $outer }}Outer: {{ with $inner }}Inner: {{ . }}{{ end }}, Outer again: {{ . }}{{ end }}',
          args: (args) => args
            .withArgument('outer', 'OuterValue')
            .withArgument('inner', 'InnerValue'),
          expected: [
            'Inner: InnerValue',
            'Outer: {{ with $inner }}Inner: {{ . }}{{ end }}, Outer again: OuterValue',
          ],
        },
        {
          name: 'renders nested with statements with context variables',
          code: '{{ with $outer }}{{ with $inner }}{{ . }}{{ . }}{{ end }}{{ . }}{{ end }}',
          args: (args) => args
            .withArgument('outer', 'O')
            .withArgument('inner', 'I'),
          expected: [
            'II',
            '{{ with $inner }}{{ . }}{{ . }}{{ end }}O',
          ],
        },
      );
    });
  });
  describe('pipe behavior', () => {
    runner.expectPipeHits({
      codeBuilder: (pipeline) => `{{ with $argument }} {{ .${pipeline}}} {{ end }}`,
      parameterName: 'argument',
      parameterValue: 'value',
    });
  });
});
