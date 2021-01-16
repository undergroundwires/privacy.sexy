import 'mocha';
import { expect } from 'chai';
import { ExpressionsCompiler } from '@/application/Parser/Script/Compiler/Expressions/ExpressionsCompiler';

describe('ExpressionsCompiler', () => {
    describe('parameter substitution', () => {
        describe('substitutes as expected', () => {
            // arrange
            const testCases = [ {
                name: 'with different parameters',
                code: 'He{{ $firstParameter }} {{ $secondParameter }}!',
                parameters: {
                    firstParameter: 'llo',
                    secondParameter: 'world',
                },
                expected: 'Hello world!',
            }, {
                name: 'with single parameter',
                code: '{{ $parameter }}!',
                parameters: {
                    parameter: 'Hodor',
                },
                expected: 'Hodor!',

            }];
            for (const testCase of testCases) {
                it(testCase.name, () => {
                    const sut = new MockableExpressionsCompiler();
                    // act
                    const actual = sut.compileExpressions(testCase.code, testCase.parameters);
                    // assert
                    expect(actual).to.equal(testCase.expected);
                });
            }
        });
        describe('throws when expected value is not provided', () => {
            // arrange
            const noParameterTestCases = [
                {
                    name: 'empty parameters',
                    code: '{{ $parameter }}!',
                    parameters: {},
                    expectedError: 'parameter value(s) not provided for: "parameter"',
                },
                {
                    name: 'undefined parameters',
                    code: '{{ $parameter }}!',
                    parameters: undefined,
                    expectedError: 'parameter value(s) not provided for: "parameter"',
                },
                {
                    name: 'unnecessary parameter provided',
                    code: '{{ $parameter }}!',
                    parameters: {
                        unnecessaryParameter: 'unnecessaryValue',
                    },
                    expectedError: 'parameter value(s) not provided for: "parameter"',
                },
                {
                    name: 'undefined value',
                    code: '{{ $parameter }}!',
                    parameters: {
                        parameter: undefined,
                    },
                    expectedError: 'parameter value(s) not provided for: "parameter"',
                },
                {
                    name: 'multiple values are not',
                    code: '{{ $parameter1 }}, {{ $parameter2 }}, {{ $parameter3 }}',
                    parameters: {},
                    expectedError: 'parameter value(s) not provided for: "parameter1", "parameter2", "parameter3"',
                },
                {
                    name: 'some values are provided',
                    code: '{{ $parameter1 }}, {{ $parameter2 }}, {{ $parameter3 }}',
                    parameters: {
                        parameter2: 'value',
                    },
                    expectedError: 'parameter value(s) not provided for: "parameter1", "parameter3"',
                },
            ];
            for (const testCase of noParameterTestCases) {
                it(testCase.name, () => {
                    const sut = new MockableExpressionsCompiler();
                    // act
                    const act = () => sut.compileExpressions(testCase.code, testCase.parameters);
                    // assert
                    expect(act).to.throw(testCase.expectedError);
                });
            }
        });
    });
});

class MockableExpressionsCompiler extends ExpressionsCompiler {
    constructor() {
        super();
    }
}
