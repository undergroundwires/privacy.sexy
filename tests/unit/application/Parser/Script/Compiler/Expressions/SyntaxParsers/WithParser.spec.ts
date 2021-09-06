import 'mocha';
import { ExpressionPosition } from '@/application/Parser/Script/Compiler/Expressions/Expression/ExpressionPosition';
import { WithParser } from '@/application/Parser/Script/Compiler/Expressions/SyntaxParsers/WithParser';
import { SyntaxParserTestsRunner } from './SyntaxParserTestsRunner';

describe('WithParser', () => {
    const sut = new WithParser();
    const runner = new SyntaxParserTestsRunner(sut);
    describe('finds as expected', () => {
        runner.expectPosition(

            {
                name: 'when no scope is not used',
                code: 'hello {{ with $parameter }}no usage{{ end }} here',
                expected: [ new ExpressionPosition(6, 44) ],
            },
            {
                name: 'when scope is used',
                code: 'used here ({{ with $parameter }}value: {{ . }}{{ end }})',
                expected: [ new ExpressionPosition(11, 55) ],
            },
            {
                name: 'when used twice',
                code: 'first: {{ with $parameter }}value: {{ . }}{{ end }}, second: {{ with $parameter }}no usage{{ end }}',
                expected: [ new ExpressionPosition(7, 51), new ExpressionPosition(61, 99) ],
            },
            {
                name: 'tolerates lack of spaces around brackets',
                code: 'no whitespaces {{with $parameter}}value: {{.}}{{end}}',
                expected: [ new ExpressionPosition(15, 53) ],
            },
            {
                name: 'does not tolerate space after dollar sign',
                code: 'used here ({{ with $ parameter }}value: {{ . }}{{ end }})',
                expected: [ ],
            },
        );
    });
    describe('ignores when syntax is unexpected', () => {
        runner.expectPosition(
            {
                name: 'does not tolerate whitespace after with',
                code: '{{with $ parameter}}value: {{ . }}{{ end }}',
                expected: [ ],
            },
            {
                name: 'does not tolerate whitespace before dollar',
                code: '{{ with$parameter}}value: {{ . }}{{ end }}',
                expected: [ ],
            },
        );
    });
    describe('ignores trailing and leading whitespaces and newlines inside scope', () => {
        runner.expectResults(
            {
                name: 'does not render trailing whitespace after value',
                code: '{{ with $parameter }}{{ . }}! {{ end }}',
                args: (args) => args
                    .withArgument('parameter', 'Hello world'),
                expected: [ 'Hello world!' ],
            },
            {
                name: 'does not render trailing newline after value',
                code: '{{ with $parameter }}{{ . }}!\r\n{{ end }}',
                args: (args) => args
                    .withArgument('parameter', 'Hello world'),
                expected: [ 'Hello world!' ],
            },
            {
                name: 'does not render leading newline before value',
                code: '{{ with $parameter }}\r\n{{ . }}!{{ end }}',
                args: (args) => args
                    .withArgument('parameter', 'Hello world'),
                expected: [ 'Hello world!' ],
            },
            {
                name: 'does not render leading whitespace before value',
                code: '{{ with $parameter }}  {{ . }}!{{ end }}',
                args: (args) => args
                    .withArgument('parameter', 'Hello world'),
                expected: [ 'Hello world!' ],
            },
        );
    });
    describe('does not render scope if argument is undefined', () => {
        runner.expectResults(
            {
                name: 'does not render when value is undefined',
                code: '{{ with $parameter }}dark{{ end }} ',
                args: (args) => args
                    .withArgument('parameter', undefined),
                expected: [ '' ],
            },
            {
                name: 'does not render when value is empty',
                code: '{{ with $parameter }}dark {{.}}{{ end }}',
                args: (args) => args
                    .withArgument('parameter', ''),
                expected: [ '' ],
            },
            {
                name: 'does not render when argument is not provided',
                code: '{{ with $parameter }}dark{{ end }}',
                args: (args) => args,
                expected: [ '' ],
            },
        );
    });
    describe('renders scope as expected', () => {
        runner.expectResults(
            {
                name: 'renders scope even if value is not used',
                code: '{{ with $parameter }}Hello world!{{ end }}',
                args: (args) => args
                    .withArgument('parameter', 'Hello'),
                expected: [ 'Hello world!' ],
            },
            {
                name: 'renders value when it has value',
                code: '{{ with $parameter }}{{ . }} world!{{ end }}',
                args: (args) => args
                    .withArgument('parameter', 'Hello'),
                expected: [ 'Hello world!' ],
            },
            {
                name: 'renders value when whitespaces around brackets are missing',
                code: '{{ with $parameter }}{{.}} world!{{ end }}',
                args: (args) => args
                    .withArgument('parameter', 'Hello'),
                expected: [ 'Hello world!' ],
            },
            {
                name: 'renders value multiple times when it\'s used multiple times',
                code: '{{ with $letterL }}He{{ . }}{{ . }}o wor{{ . }}d!{{ end }}',
                args: (args) => args
                    .withArgument('letterL', 'l'),
                expected: [ 'Hello world!' ],
            },
        );
    });
});
