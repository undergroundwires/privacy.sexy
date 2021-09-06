import 'mocha';
import { expect } from 'chai';
import { ExpressionPosition } from '@/application/Parser/Script/Compiler/Expressions/Expression/ExpressionPosition';
import { IExpressionParser } from '@/application/Parser/Script/Compiler/Expressions/Parser/IExpressionParser';
import { FunctionCallArgumentCollectionStub } from '@tests/unit/stubs/FunctionCallArgumentCollectionStub';

export class SyntaxParserTestsRunner {
    constructor(private readonly sut: IExpressionParser) {
    }
    public expectPosition(...testCases: IExpectPositionTestCase[]) {
        for (const testCase of testCases) {
            it(testCase.name, () => {
                // act
                const expressions = this.sut.findExpressions(testCase.code);
                // assert
                const actual = expressions.map((e) => e.position);
                expect(actual).to.deep.equal(testCase.expected);
            });
        }
        return this;
    }
    public expectResults(...testCases: IExpectResultTestCase[]) {
        for (const testCase of testCases) {
            it(testCase.name, () => {
                // arrange
                const args = testCase.args(new FunctionCallArgumentCollectionStub());
                // act
                const expressions = this.sut.findExpressions(testCase.code);
                // assert
                const actual = expressions.map((e) => e.evaluate(args));
                expect(actual).to.deep.equal(testCase.expected);
            });
        }
        return this;
    }
}

interface IExpectResultTestCase {
    name: string;
    code: string;
    args: (builder: FunctionCallArgumentCollectionStub) => FunctionCallArgumentCollectionStub;
    expected: readonly string[];
}

interface IExpectPositionTestCase {
    name: string;
    code: string;
    expected: readonly ExpressionPosition[];
}
