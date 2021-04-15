import 'mocha';
import { expect } from 'chai';
import { ExpressionsCompiler } from '@/application/Parser/Script/Compiler/Expressions/ExpressionsCompiler';
import { IExpressionParser } from '@/application/Parser/Script/Compiler/Expressions/Parser/IExpressionParser';
import { ExpressionStub } from '@tests/unit/stubs/ExpressionStub';
import { ExpressionParserStub } from '@tests/unit/stubs/ExpressionParserStub';

describe('ExpressionsCompiler', () => {
    describe('compileExpressions', () => {
        describe('combines expressions as expected', () => {
            // arrange
            const code = 'part1 {{ a }} part2 {{ b }} part3';
            const testCases = [
                {
                    name: 'with ordered expressions',
                    expressions: [
                        new ExpressionStub().withPosition(6, 13).withEvaluatedResult('a'),
                        new ExpressionStub().withPosition(20, 27).withEvaluatedResult('b'),
                    ],
                    expected: 'part1 a part2 b part3',
                },
                {
                    name: 'unordered expressions',
                    expressions: [
                        new ExpressionStub().withPosition(6, 13).withEvaluatedResult('a'),
                        new ExpressionStub().withPosition(20, 27).withEvaluatedResult('b'),
                    ],
                    expected: 'part1 a part2 b part3',
                },
                {
                    name: 'with no expressions',
                    expressions: [],
                    expected: code,
                },
            ];
            for (const testCase of testCases) {
                it(testCase.name, () => {
                    const expressionParserMock = new ExpressionParserStub()
                        .withResult(testCase.expressions);
                    const sut = new MockableExpressionsCompiler(expressionParserMock);
                    // act
                    const actual = sut.compileExpressions(code);
                    // assert
                    expect(actual).to.equal(testCase.expected);
                });
            }
        });
        it('passes arguments to expressions as expected', () => {
            // arrange
            const expected = {
                parameter1: 'value1',
                parameter2: 'value2',
            };
            const code = 'non-important';
            const expressions = [
                new ExpressionStub(),
                new ExpressionStub(),
            ];
            const expressionParserMock = new ExpressionParserStub()
                .withResult(expressions);
            const sut = new MockableExpressionsCompiler(expressionParserMock);
            // act
            sut.compileExpressions(code, expected);
            // assert
            expect(expressions[0].callHistory).to.have.lengthOf(1);
            expect(expressions[0].callHistory[0]).to.equal(expected);
            expect(expressions[1].callHistory).to.have.lengthOf(1);
            expect(expressions[1].callHistory[0]).to.equal(expected);
        });
        describe('throws when expected argument is not provided', () => {
            // arrange
            const noParameterTestCases = [
                {
                    name: 'empty parameters',
                    expressions: [
                        new ExpressionStub().withParameters('parameter'),
                    ],
                    args: {},
                    expectedError: 'parameter value(s) not provided for: "parameter"',
                },
                {
                    name: 'undefined parameters',
                    expressions: [
                        new ExpressionStub().withParameters('parameter'),
                    ],
                    args: undefined,
                    expectedError: 'parameter value(s) not provided for: "parameter"',
                },
                {
                    name: 'unnecessary parameter provided',
                    expressions: [
                        new ExpressionStub().withParameters('parameter'),
                    ],
                    args: {
                        unnecessaryParameter: 'unnecessaryValue',
                    },
                    expectedError: 'parameter value(s) not provided for: "parameter"',
                },
                {
                    name: 'undefined value',
                    expressions: [
                        new ExpressionStub().withParameters('parameter'),
                    ],
                    args: {
                        parameter: undefined,
                    },
                    expectedError: 'parameter value(s) not provided for: "parameter"',
                },
                {
                    name: 'multiple values are not provided',
                    expressions: [
                        new ExpressionStub().withParameters('parameter1'),
                        new ExpressionStub().withParameters('parameter2', 'parameter3'),
                    ],
                    args: {},
                    expectedError: 'parameter value(s) not provided for: "parameter1", "parameter2", "parameter3"',
                },
                {
                    name: 'some values are provided',
                    expressions: [
                        new ExpressionStub().withParameters('parameter1'),
                        new ExpressionStub().withParameters('parameter2', 'parameter3'),
                    ],
                    args: {
                        parameter2: 'value',
                    },
                    expectedError: 'parameter value(s) not provided for: "parameter1", "parameter3"',
                },
            ];
            for (const testCase of noParameterTestCases) {
                it(testCase.name, () => {
                    const code = 'non-important-code';
                    const expressionParserMock = new ExpressionParserStub()
                        .withResult(testCase.expressions);
                    const sut = new MockableExpressionsCompiler(expressionParserMock);
                    // act
                    const act = () => sut.compileExpressions(code, testCase.args);
                    // assert
                    expect(act).to.throw(testCase.expectedError);
                });
            }
        });
        it('calls parser with expected code', () => {
            // arrange
            const expected = 'expected-code';
            const expressionParserMock = new ExpressionParserStub();
            const sut = new MockableExpressionsCompiler(expressionParserMock);
            // act
            sut.compileExpressions(expected);
            // assert
            expect(expressionParserMock.callHistory).to.have.lengthOf(1);
            expect(expressionParserMock.callHistory[0]).to.equal(expected);
        });
    });
});

class MockableExpressionsCompiler extends ExpressionsCompiler {
    constructor(extractor: IExpressionParser) {
        super(extractor);
    }
}
