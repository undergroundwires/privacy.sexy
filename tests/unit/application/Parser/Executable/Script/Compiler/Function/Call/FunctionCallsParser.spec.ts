import { describe, it, expect } from 'vitest';
import type { FunctionCallsData, FunctionCallData } from '@/application/collections/';
import { parseFunctionCalls } from '@/application/Parser/Executable/Script/Compiler/Function/Call/FunctionCallsParser';
import { FunctionCallDataStub } from '@tests/unit/shared/Stubs/FunctionCallDataStub';
import { itEachAbsentStringValue } from '@tests/unit/shared/TestCases/AbsentTests';
import type {
  NonEmptyCollectionAssertion, ObjectAssertion, TypeValidator,
} from '@/application/Parser/Common/TypeValidator';
import { TypeValidatorStub } from '@tests/unit/shared/Stubs/TypeValidatorStub';
import type { FunctionCallArgumentFactory } from '@/application/Parser/Executable/Script/Compiler/Function/Call/Argument/FunctionCallArgument';
import { FunctionCallArgumentFactoryStub } from '@tests/unit/shared/Stubs/FunctionCallArgumentFactoryStub';

describe('FunctionCallsParser', () => {
  describe('parseFunctionCalls', () => {
    describe('throws if single call is not an object or array', () => {
      // arrange
      const expectedError = 'called function(s) must be an object or array';
      const testScenarios: readonly {
        readonly description: string;
        readonly invalidData: FunctionCallsData;
      }[] = [
        {
          description: 'given a string',
          invalidData: 'string' as unknown as FunctionCallsData,
        },
        {
          description: 'given a number',
          invalidData: 33 as unknown as FunctionCallsData,
        },
        {
          description: 'given a boolean',
          invalidData: false as unknown as FunctionCallsData,
        },
        {
          description: 'given null',
          invalidData: null as unknown as FunctionCallsData,
        },
        {
          description: 'given undefined',
          invalidData: undefined as unknown as FunctionCallsData,
        },
      ];
      testScenarios.forEach(({ description, invalidData }) => {
        it(description, () => {
          const context = new TestContext()
            .withData(invalidData);
          // act
          const act = () => context.parse();
          // assert
          expect(act).to.throw(expectedError);
        });
      });
    });
    describe('given a single call', () => {
      it('validates single call as object', () => {
        // arrange
        const data = new FunctionCallDataStub();
        const expectedAssertion: ObjectAssertion<FunctionCallData> = {
          value: data,
          valueName: 'Function call',
          allowedProperties: [
            'function', 'parameters',
          ],
        };
        const validator = new TypeValidatorStub();
        const context = new TestContext()
          .withData(data)
          .withTypeValidator(validator);
        // act
        context.parse();
        // assert
        validator.expectObjectAssertion(expectedAssertion);
      });
      it('parses single call as expected', () => {
        // arrange
        const expectedFunctionName = 'functionName';
        const expectedParameterName = 'parameterName';
        const expectedArgumentValue = 'argumentValue';
        const data = new FunctionCallDataStub()
          .withName(expectedFunctionName)
          .withParameters({ [expectedParameterName]: expectedArgumentValue });
        // act
        const actual = parseFunctionCalls(data);
        // assert
        expect(actual).to.have.lengthOf(1);
        const call = actual[0];
        expect(call.functionName).to.equal(expectedFunctionName);
        const { args } = call;
        expect(args.getAllParameterNames()).to.have.lengthOf(1);
        expect(args.hasArgument(expectedParameterName)).to.equal(
          true,
          `Does not include expected parameter: "${expectedParameterName}"\n`
            + `But includes: "${args.getAllParameterNames()}"`,
        );
        const argument = args.getArgument(expectedParameterName);
        expect(argument.parameterName).to.equal(expectedParameterName);
        expect(argument.argumentValue).to.equal(expectedArgumentValue);
      });
    });
    describe('given a call sequence', () => {
      describe('throws if call sequence has undefined function name', () => {
        itEachAbsentStringValue((absentValue) => {
          // arrange
          const expectedError = 'missing function name in function call';
          const data = [
            new FunctionCallDataStub().withName('function-name'),
            new FunctionCallDataStub().withName(absentValue),
          ];
          // act
          const act = () => parseFunctionCalls(data);
          // assert
          expect(act).to.throw(expectedError);
        }, { excludeNull: true, excludeUndefined: true });
      });
      it('validates call sequence as non empty collection', () => {
        // arrange
        const data: FunctionCallsData = [new FunctionCallDataStub()];
        const expectedAssertion: NonEmptyCollectionAssertion = {
          value: data,
          valueName: 'Function call sequence',
        };
        const validator = new TypeValidatorStub();
        const context = new TestContext()
          .withData(data)
          .withTypeValidator(validator);
        // act
        context.parse();
        // assert
        validator.expectNonEmptyCollectionAssertion(expectedAssertion);
      });
      it('validates a call in call sequence as object', () => {
        // arrange
        const expectedValidatedCallData = new FunctionCallDataStub();
        const data: FunctionCallsData = [expectedValidatedCallData];
        const expectedAssertion: ObjectAssertion<FunctionCallData> = {
          value: expectedValidatedCallData,
          valueName: 'Function call',
          allowedProperties: [
            'function', 'parameters',
          ],
        };
        const validator = new TypeValidatorStub();
        const context = new TestContext()
          .withData(data)
          .withTypeValidator(validator);
        // act
        context.parse();
        // assert
        validator.expectObjectAssertion(expectedAssertion);
      });
      it('parses multiple calls as expected', () => {
        // arrange
        const getFunctionName = (index: number) => `functionName${index}`;
        const getParameterName = (index: number) => `parameterName${index}`;
        const getArgumentValue = (index: number) => `argumentValue${index}`;
        const createCall = (index: number) => new FunctionCallDataStub()
          .withName(getFunctionName(index))
          .withParameters({ [getParameterName(index)]: getArgumentValue(index) });
        const calls = [createCall(0), createCall(1), createCall(2), createCall(3)];
        // act
        const actual = parseFunctionCalls(calls);
        // assert
        expect(actual).to.have.lengthOf(calls.length);
        for (let i = 0; i < calls.length; i++) {
          const call = actual[i];
          const expectedParameterName = getParameterName(i);
          const expectedArgumentValue = getArgumentValue(i);
          expect(call.functionName).to.equal(getFunctionName(i));
          expect(call.args.getAllParameterNames()).to.have.lengthOf(1);
          expect(call.args.hasArgument(expectedParameterName)).to.equal(true);
          const argument = call.args.getArgument(expectedParameterName);
          expect(argument.parameterName).to.equal(expectedParameterName);
          expect(argument.argumentValue).to.equal(expectedArgumentValue);
        }
      });
    });
  });
});

class TestContext {
  private typeValidator: TypeValidator = new TypeValidatorStub();

  private createCallArgument
  : FunctionCallArgumentFactory = new FunctionCallArgumentFactoryStub().factory;

  private calls: FunctionCallsData = [new FunctionCallDataStub()];

  public withTypeValidator(typeValidator: TypeValidator): this {
    this.typeValidator = typeValidator;
    return this;
  }

  public withData(calls: FunctionCallsData): this {
    this.calls = calls;
    return this;
  }

  public parse(): ReturnType<typeof parseFunctionCalls> {
    return parseFunctionCalls(
      this.calls,
      {
        typeValidator: this.typeValidator,
        createCallArgument: this.createCallArgument,
      },
    );
  }
}
