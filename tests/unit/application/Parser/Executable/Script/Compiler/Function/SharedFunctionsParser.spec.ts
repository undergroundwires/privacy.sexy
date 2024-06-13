import { describe, it, expect } from 'vitest';
import type { FunctionData, CodeInstruction } from '@/application/collections/';
import type { ISharedFunction } from '@/application/Parser/Executable/Script/Compiler/Function/ISharedFunction';
import { SharedFunctionsParser, type FunctionParameterFactory } from '@/application/Parser/Executable/Script/Compiler/Function/SharedFunctionsParser';
import { createFunctionDataWithCode, createFunctionDataWithoutCallOrCode } from '@tests/unit/shared/Stubs/FunctionDataStub';
import { ParameterDefinitionDataStub } from '@tests/unit/shared/Stubs/ParameterDefinitionDataStub';
import { FunctionCallDataStub } from '@tests/unit/shared/Stubs/FunctionCallDataStub';
import { itEachAbsentCollectionValue } from '@tests/unit/shared/TestCases/AbsentTests';
import type { ILanguageSyntax } from '@/application/Parser/Executable/Script/Validation/Syntax/ILanguageSyntax';
import { LanguageSyntaxStub } from '@tests/unit/shared/Stubs/LanguageSyntaxStub';
import { itIsSingletonFactory } from '@tests/unit/shared/TestCases/SingletonFactoryTests';
import { CodeValidatorStub } from '@tests/unit/shared/Stubs/CodeValidatorStub';
import type { ICodeValidator } from '@/application/Parser/Executable/Script/Validation/ICodeValidator';
import { NoEmptyLines } from '@/application/Parser/Executable/Script/Validation/Rules/NoEmptyLines';
import { NoDuplicatedLines } from '@/application/Parser/Executable/Script/Validation/Rules/NoDuplicatedLines';
import type { ErrorWithContextWrapper } from '@/application/Parser/Common/ContextualError';
import { FunctionParameterStub } from '@tests/unit/shared/Stubs/FunctionParameterStub';
import { errorWithContextWrapperStub } from '@tests/unit/shared/Stubs/ErrorWithContextWrapperStub';
import { itThrowsContextualError } from '@tests/unit/application/Parser/Common/ContextualErrorTester';
import type { FunctionParameterCollectionFactory } from '@/application/Parser/Executable/Script/Compiler/Function/Parameter/FunctionParameterCollectionFactory';
import { FunctionParameterCollectionStub } from '@tests/unit/shared/Stubs/FunctionParameterCollectionStub';
import { expectCallsFunctionBody, expectCodeFunctionBody } from './ExpectFunctionBodyType';

describe('SharedFunctionsParser', () => {
  describe('instance', () => {
    itIsSingletonFactory({
      getter: () => SharedFunctionsParser.instance,
      expectedType: SharedFunctionsParser,
    });
  });
  describe('parseFunctions', () => {
    describe('validates functions', () => {
      it('throws when functions have no names', () => {
        // arrange
        const invalidFunctions = [
          createFunctionDataWithCode()
            .withCode('test function 1')
            .withName(' '), // Whitespace,
          createFunctionDataWithCode()
            .withCode('test function 2')
            .withName(undefined as unknown as string), // Undefined
          createFunctionDataWithCode()
            .withCode('test function 3')
            .withName(''), // Empty
        ];
        const expectedError = `Some function(s) have no names:\n${invalidFunctions.map((f) => JSON.stringify(f)).join('\n')}`;
        // act
        const act = () => new ParseFunctionsCallerWithDefaults()
          .withFunctions(invalidFunctions)
          .parseFunctions();
        // assert
        expect(act).to.throw(expectedError);
      });
      it('throws when functions have same names', () => {
        // arrange
        const name = 'same-func-name';
        const expectedError = `duplicate function name: "${name}"`;
        const functions = [
          createFunctionDataWithCode().withName(name),
          createFunctionDataWithCode().withName(name),
        ];
        // act
        const act = () => new ParseFunctionsCallerWithDefaults()
          .withFunctions(functions)
          .parseFunctions();
        // assert
        expect(act).to.throw(expectedError);
      });
      describe('throws when when function have duplicate code', () => {
        it('code', () => {
          // arrange
          const code = 'duplicate-code';
          const expectedError = `duplicate "code" in functions: "${code}"`;
          const functions = [
            createFunctionDataWithoutCallOrCode().withName('func-1').withCode(code),
            createFunctionDataWithoutCallOrCode().withName('func-2').withCode(code),
          ];
          // act
          const act = () => new ParseFunctionsCallerWithDefaults()
            .withFunctions(functions)
            .parseFunctions();
          // assert
          expect(act).to.throw(expectedError);
        });
        it('revertCode', () => {
          // arrange
          const revertCode = 'duplicate-revert-code';
          const expectedError = `duplicate "revertCode" in functions: "${revertCode}"`;
          const functions = [
            createFunctionDataWithoutCallOrCode()
              .withName('func-1').withCode('code-1').withRevertCode(revertCode),
            createFunctionDataWithoutCallOrCode()
              .withName('func-2').withCode('code-2').withRevertCode(revertCode),
          ];
          // act
          const act = () => new ParseFunctionsCallerWithDefaults()
            .withFunctions(functions)
            .parseFunctions();
          // assert
          expect(act).to.throw(expectedError);
        });
      });
      describe('ensures either call or code is defined', () => {
        it('both code and call are defined', () => {
          // arrange
          const functionName = 'invalid-function';
          const expectedError = `both "code" and "call" are defined in "${functionName}"`;
          const invalidFunction = createFunctionDataWithoutCallOrCode()
            .withName(functionName)
            .withCode('code')
            .withMockCall();
          // act
          const act = () => new ParseFunctionsCallerWithDefaults()
            .withFunctions([invalidFunction])
            .parseFunctions();
          // assert
          expect(act).to.throw(expectedError);
        });
        it('neither code and call is defined', () => {
          // arrange
          const functionName = 'invalid-function';
          const expectedError = `neither "code" or "call" is defined in "${functionName}"`;
          const invalidFunction = createFunctionDataWithoutCallOrCode()
            .withName(functionName);
          // act
          const act = () => new ParseFunctionsCallerWithDefaults()
            .withFunctions([invalidFunction])
            .parseFunctions();
          // assert
          expect(act).to.throw(expectedError);
        });
      });
      describe('throws when parameters type is not as expected', () => {
        const testScenarios = [
          {
            state: 'when not an array',
            invalidType: 5,
          },
          {
            state: 'when array but not of objects',
            invalidType: ['a', { a: 'b' }],
          },
        ];
        for (const testCase of testScenarios) {
          it(testCase.state, () => {
            // arrange
            const func = createFunctionDataWithCode()
              .withParametersObject(testCase.invalidType as never);
            const expectedError = `parameters must be an array of objects in function(s) "${func.name}"`;
            // act
            const act = () => new ParseFunctionsCallerWithDefaults()
              .withFunctions([func])
              .parseFunctions();
            // assert
            expect(act).to.throw(expectedError);
          });
        }
      });
      it('validates function code as expected when code is defined', () => {
        // arrange
        const expectedRules = [NoEmptyLines, NoDuplicatedLines];
        const functionData = createFunctionDataWithCode()
          .withCode('expected code to be validated')
          .withRevertCode('expected revert code to be validated');
        const validator = new CodeValidatorStub();
        // act
        new ParseFunctionsCallerWithDefaults()
          .withFunctions([functionData])
          .withValidator(validator)
          .parseFunctions();
        // assert
        validator.assertHistory({
          validatedCodes: [functionData.code, functionData.revertCode],
          rules: expectedRules,
        });
      });
      describe('parameter creation', () => {
        describe('rethrows including function name when creating parameter throws', () => {
          // arrange
          const invalidParameterName = 'invalid-function-parameter-name';
          const functionName = 'functionName';
          const expectedErrorMessage = `Failed to create parameter: ${invalidParameterName} for function "${functionName}"`;
          const expectedInnerError = new Error('injected error');
          const parameterFactory: FunctionParameterFactory = () => {
            throw expectedInnerError;
          };
          const functionData = createFunctionDataWithCode()
            .withName(functionName)
            .withParameters(new ParameterDefinitionDataStub().withName(invalidParameterName));
          itThrowsContextualError({
            // act
            throwingAction: (wrapError) => {
              new ParseFunctionsCallerWithDefaults()
                .withFunctions([functionData])
                .withFunctionParameterFactory(parameterFactory)
                .withErrorWrapper(wrapError)
                .parseFunctions();
            },
            // assert
            expectedWrappedError: expectedInnerError,
            expectedContextMessage: expectedErrorMessage,
          });
        });
      });
    });
    describe('given empty functions, returns empty collection', () => {
      itEachAbsentCollectionValue<FunctionData>((absentValue) => {
        // act
        const actual = new ParseFunctionsCallerWithDefaults()
          .withFunctions(absentValue)
          .parseFunctions();
        // assert
        expect(actual).to.not.equal(undefined);
      }, { excludeUndefined: true, excludeNull: true });
    });
    describe('function with inline code', () => {
      it('parses single function with code as expected', () => {
        // arrange
        const name = 'function-name';
        const expected = createFunctionDataWithoutCallOrCode()
          .withName(name)
          .withCode('expected-code')
          .withRevertCode('expected-revert-code')
          .withParameters(
            new ParameterDefinitionDataStub().withName('expectedParameter').withOptionality(true),
            new ParameterDefinitionDataStub().withName('expectedParameter2').withOptionality(false),
          );
        // act
        const collection = new ParseFunctionsCallerWithDefaults()
          .withFunctions([expected])
          .parseFunctions();
        // expect
        const actual = collection.getFunctionByName(name);
        expectEqualName(expected, actual);
        expectEqualParameters(expected, actual);
        expectEqualFunctionWithInlineCode(expected, actual);
      });
    });
    describe('function with calls', () => {
      it('parses single function with call as expected', () => {
        // arrange
        const call = new FunctionCallDataStub()
          .withName('calleeFunction')
          .withParameters({ test: 'value' });
        const data = createFunctionDataWithoutCallOrCode()
          .withName('caller-function')
          .withCall(call);
        // act
        const collection = new ParseFunctionsCallerWithDefaults()
          .withFunctions([data])
          .parseFunctions();
        // expect
        const actual = collection.getFunctionByName(data.name);
        expectEqualName(data, actual);
        expectEqualParameters(data, actual);
        expectEqualCalls([call], actual);
      });
      it('parses multiple functions with call as expected', () => {
        // arrange
        const call1 = new FunctionCallDataStub()
          .withName('calleeFunction1')
          .withParameters({ param: 'value' });
        const call2 = new FunctionCallDataStub()
          .withName('calleeFunction2')
          .withParameters({ param2: 'value2' });
        const caller1 = createFunctionDataWithoutCallOrCode()
          .withName('caller-function')
          .withCall(call1);
        const caller2 = createFunctionDataWithoutCallOrCode()
          .withName('caller-function-2')
          .withCall([call1, call2]);
        // act
        const collection = new ParseFunctionsCallerWithDefaults()
          .withFunctions([caller1, caller2])
          .parseFunctions();
        // expect
        const compiledCaller1 = collection.getFunctionByName(caller1.name);
        expectEqualName(caller1, compiledCaller1);
        expectEqualParameters(caller1, compiledCaller1);
        expectEqualCalls([call1], compiledCaller1);
        const compiledCaller2 = collection.getFunctionByName(caller2.name);
        expectEqualName(caller2, compiledCaller2);
        expectEqualParameters(caller2, compiledCaller2);
        expectEqualCalls([call1, call2], compiledCaller2);
      });
    });
  });
});

class ParseFunctionsCallerWithDefaults {
  private syntax: ILanguageSyntax = new LanguageSyntaxStub();

  private codeValidator: ICodeValidator = new CodeValidatorStub();

  private functions: readonly FunctionData[] = [createFunctionDataWithCode()];

  private wrapError: ErrorWithContextWrapper = errorWithContextWrapperStub;

  private parameterFactory: FunctionParameterFactory = (
    name: string,
    isOptional: boolean,
  ) => new FunctionParameterStub()
    .withName(name)
    .withOptional(isOptional);

  private parameterCollectionFactory
  : FunctionParameterCollectionFactory = () => new FunctionParameterCollectionStub();

  public withSyntax(syntax: ILanguageSyntax) {
    this.syntax = syntax;
    return this;
  }

  public withValidator(codeValidator: ICodeValidator) {
    this.codeValidator = codeValidator;
    return this;
  }

  public withFunctions(functions: readonly FunctionData[]) {
    this.functions = functions;
    return this;
  }

  public withErrorWrapper(wrapError: ErrorWithContextWrapper): this {
    this.wrapError = wrapError;
    return this;
  }

  public withFunctionParameterFactory(parameterFactory: FunctionParameterFactory): this {
    this.parameterFactory = parameterFactory;
    return this;
  }

  public withParameterCollectionFactory(
    parameterCollectionFactory: FunctionParameterCollectionFactory,
  ): this {
    this.parameterCollectionFactory = parameterCollectionFactory;
    return this;
  }

  public parseFunctions() {
    const sut = new SharedFunctionsParser(
      {
        codeValidator: this.codeValidator,
        wrapError: this.wrapError,
        createParameter: this.parameterFactory,
        createParameterCollection: this.parameterCollectionFactory,
      },
    );
    return sut.parseFunctions(this.functions, this.syntax);
  }
}

function expectEqualName(expected: FunctionData, actual: ISharedFunction): void {
  expect(actual.name).to.equal(expected.name);
}

function expectEqualParameters(expected: FunctionData, actual: ISharedFunction): void {
  const actualSimplifiedParameters = actual.parameters.all.map((parameter) => ({
    name: parameter.name,
    optional: parameter.isOptional,
  }));
  const expectedSimplifiedParameters = expected.parameters?.map((parameter) => ({
    name: parameter.name,
    optional: parameter.optional || false,
  })) || [];
  expect(expectedSimplifiedParameters).to.deep.equal(actualSimplifiedParameters, 'Unequal parameters');
}

function expectEqualFunctionWithInlineCode(
  expected: CodeInstruction,
  actual: ISharedFunction,
): void {
  expect(actual.body, `function "${actual.name}" has no body`);
  expectCodeFunctionBody(actual.body);
  expect(actual.body.code, `function "${actual.name}" has no code`);
  expect(actual.body.code.execute).to.equal(expected.code);
  expect(actual.body.code.revert).to.equal(expected.revertCode);
}

function expectEqualCalls(
  expected: FunctionCallDataStub[],
  actual: ISharedFunction,
) {
  expect(actual.body, `function "${actual.name}" has no body`);
  expectCallsFunctionBody(actual.body);
  expect(actual.body.calls, `function "${actual.name}" has no calls`);
  const actualSimplifiedCalls = actual.body.calls
    .map((call) => ({
      function: call.functionName,
      params: call.args.getAllParameterNames().map((name) => ({
        name, value: call.args.getArgument(name).argumentValue,
      })),
    }));
  const expectedSimplifiedCalls = expected
    .map((call) => ({
      function: call.function,
      params: Object.keys(call.parameters).map((key) => (
        { name: key, value: call.parameters[key] }
      )),
    }));
  expect(actualSimplifiedCalls).to.deep.equal(expectedSimplifiedCalls, 'Unequal calls');
}
