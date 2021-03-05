import 'mocha';
import { expect } from 'chai';
import { ExpressionPosition } from '@/application/Parser/Script/Compiler/Expressions/Expression/ExpressionPosition';
import { ExpressionEvaluator } from '@/application/Parser/Script/Compiler/Expressions/Expression/Expression';
import { Expression } from '@/application/Parser/Script/Compiler/Expressions/Expression/Expression';
import { ExpressionArguments } from '@/application/Parser/Script/Compiler/Expressions/Expression/IExpression';

describe('Expression', () => {
    describe('ctor', () => {
        describe('position', () => {
            it('throws if undefined', () => {
                // arrange
                const expectedError = 'undefined position';
                const position = undefined;
                // act
                const act = () => new ExpressionBuilder()
                    .withPosition(position)
                    .build();
                // assert
                expect(act).to.throw(expectedError);
            });
            it('sets as expected', () => {
                // arrange
                const expected = new ExpressionPosition(0, 5);
                // act
                const actual = new ExpressionBuilder()
                    .withPosition(expected)
                    .build();
                // assert
                expect(actual.position).to.equal(expected);
            });
        });
        describe('parameters', () => {
            it('defaults to empty array if undefined', () => {
                // arrange
                const parameters = undefined;
                // act
                const actual = new ExpressionBuilder()
                    .withParameters(parameters)
                    .build();
                // assert
                expect(actual.parameters).to.have.lengthOf(0);
            });
            it('sets as expected', () => {
                // arrange
                const expected = [ 'firstParameterName', 'secondParameterName' ];
                // act
                const actual = new ExpressionBuilder()
                    .withParameters(expected)
                    .build();
                // assert
                expect(actual.parameters).to.deep.equal(expected);
            });
        });
        describe('evaluator', () => {
            it('throws if undefined', () => {
                // arrange
                const expectedError = 'undefined evaluator';
                const evaluator = undefined;
                // act
                const act = () => new ExpressionBuilder()
                    .withEvaluator(evaluator)
                    .build();
                // assert
                expect(act).to.throw(expectedError);
            });
        });
    });
    describe('evaluate', () => {
        it('returns result from evaluator', () => {
            // arrange
            const evaluatorMock: ExpressionEvaluator = (args) => JSON.stringify(args);
            const givenArguments = { parameter1: 'value1', parameter2: 'value2' };
            const expected = evaluatorMock(givenArguments);
            const sut = new ExpressionBuilder()
                .withEvaluator(evaluatorMock)
                .withParameters(Object.keys(givenArguments))
                .build();
            // arrange
            const actual = sut.evaluate(givenArguments);
            // assert
            expect(expected).to.equal(actual);
        });
        it('filters unused arguments', () => {
            // arrange
            let actual: ExpressionArguments = {};
            const evaluatorMock: ExpressionEvaluator = (providedArgs) => {
                Object.keys(providedArgs)
                    .forEach((name) => actual = {...actual, [name]: providedArgs[name] });
                return '';
            };
            const parameterNameToHave = 'parameterToHave';
            const parameterNameToIgnore = 'parameterToIgnore';
            const sut = new ExpressionBuilder()
                .withEvaluator(evaluatorMock)
                .withParameters([ parameterNameToHave ])
                .build();
            const args: ExpressionArguments = {
                [parameterNameToHave]: 'value-to-have',
                [parameterNameToIgnore]: 'value-to-ignore',
            };
            const expected: ExpressionArguments = {
                [parameterNameToHave]: args[parameterNameToHave],
            };
            // arrange
            sut.evaluate(args);
            // assert
            expect(expected).to.deep.equal(actual);
        });
    });
});

class ExpressionBuilder {
    private position: ExpressionPosition = new ExpressionPosition(0, 5);
    private parameters: readonly string[] = new Array<string>();

    public withPosition(position: ExpressionPosition) {
        this.position = position;
        return this;
    }
    public withEvaluator(evaluator: ExpressionEvaluator) {
        this.evaluator = evaluator;
        return this;
    }
    public withParameters(parameters: string[]) {
        this.parameters = parameters;
        return this;
    }
    public build() {
        return new Expression(this.position, this.evaluator, this.parameters);
    }

    private evaluator: ExpressionEvaluator = () => '';
}
