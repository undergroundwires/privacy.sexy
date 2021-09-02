import 'mocha';
import { expect } from 'chai';
import { ParameterSubstitutionParser } from '@/application/Parser/Script/Compiler/Expressions/SyntaxParsers/ParameterSubstitutionParser';
import { ExpressionPosition } from '@/application/Parser/Script/Compiler/Expressions/Expression/ExpressionPosition';
import { FunctionCallArgumentCollectionStub } from '@tests/unit/stubs/FunctionCallArgumentCollectionStub';

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
            {
                name: 'does not tolerate space after dollar sign',
                code: 'He{{ $ firstParameter }}!!',
                expected: [ ],
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
            args: new FunctionCallArgumentCollectionStub()
                .withArgument('parameter', 'Hello world'),
            expected: [ 'Hello world' ],
        },
        {
            name: 'different parameters',
            code: '{{ $firstParameter }} {{ $secondParameter }}!',
            args: new FunctionCallArgumentCollectionStub()
                .withArgument('firstParameter', 'Hello')
                .withArgument('secondParameter', 'World'),
            expected: [ 'Hello', 'World' ],
        }];
        for (const testCase of testCases) {
            it(testCase.name, () => {
                const sut = new ParameterSubstitutionParser();
                // act
                const expressions = sut.findExpressions(testCase.code);
                // assert
                const actual = expressions.map((e) => e.evaluate(testCase.args));
                expect(actual).to.deep.equal(testCase.expected);
            });
        }
    });
});

