import 'mocha';
import { expect } from 'chai';
import { ParameterSubstitutionParser } from '@/application/Parser/Script/Compiler/Expressions/SyntaxParsers/ParameterSubstitutionParser';
import { ExpressionPosition } from '@/application/Parser/Script/Compiler/Expressions/Expression/ExpressionPosition';
import { ExpressionArguments } from '@/application/Parser/Script/Compiler/Expressions/Expression/IExpression';

describe('ParameterSubstitutionParser', () => {
    describe('finds at expected positions', () => {
        // arrange
        const testCases = [
            {
                name: 'matches single parameter',
                code: '{{ $parameter }}!',
                expected: [new ExpressionPosition(0, 16)],
            },
            {
                name: 'matches different parameters',
                code: 'He{{ $firstParameter }} {{ $secondParameter }}!!',
                expected: [new ExpressionPosition(2, 23), new ExpressionPosition(24, 46)],
            },
            {
                name: 'tolerates spaces around brackets',
                code: 'He{{$firstParameter}}!!',
                expected: [new ExpressionPosition(2, 21) ],
            },
        ];
        for (const testCase of testCases) {
            it(testCase.name, () => {
                const sut = new ParameterSubstitutionParser();
                // act
                const expressions = sut.findExpressions(testCase.code);
                // assert
                const actual = expressions.map((e) => e.position);
                expect(actual).to.deep.equal(testCase.expected);
            });
        }
    });
    describe('evaluates as expected', () => {
        const testCases = [ {
            name: 'single parameter',
            code: '{{ $parameter }}',
            args: [ {
                name: 'parameter',
                value: 'Hello world',
            }],
            expected: [ 'Hello world' ],
        },
        {
            name: 'different parameters',
            code: '{{ $firstParameter }} {{ $secondParameter }}!',
            args: [ {
                name: 'firstParameter',
                value: 'Hello',
            },
            {
                name: 'secondParameter',
                value: 'World',
            }],
            expected: [ 'Hello', 'World' ],
        }];
        for (const testCase of testCases) {
            it(testCase.name, () => {
                const sut = new ParameterSubstitutionParser();
                let args: ExpressionArguments = {};
                for (const arg of testCase.args) {
                    args = {...args, [arg.name]: arg.value };
                }
                // act
                const expressions = sut.findExpressions(testCase.code);
                // assert
                const actual = expressions.map((e) => e.evaluate(args));
                expect(actual).to.deep.equal(testCase.expected);
            });
        }
    });
});

