import { describe, it, expect } from 'vitest';
import type {
  FunctionData, CodeInstruction,
  ParameterDefinitionData, FunctionCallsData,
} from '@/application/collections/';
import type { ISharedFunction } from '@/application/Parser/Executable/Script/Compiler/Function/ISharedFunction';
import { parseSharedFunctions } from '@/application/Parser/Executable/Script/Compiler/Function/SharedFunctionsParser';
import { createFunctionDataWithCall, createFunctionDataWithCode, createFunctionDataWithoutCallOrCode } from '@tests/unit/shared/Stubs/FunctionDataStub';
import { ParameterDefinitionDataStub } from '@tests/unit/shared/Stubs/ParameterDefinitionDataStub';
import { FunctionCallDataStub } from '@tests/unit/shared/Stubs/FunctionCallDataStub';
import { itEachAbsentCollectionValue } from '@tests/unit/shared/TestCases/AbsentTests';
import { CodeValidatorStub } from '@tests/unit/shared/Stubs/CodeValidatorStub';
import type { CodeValidator } from '@/application/Parser/Executable/Script/Validation/CodeValidator';
import type { ErrorWithContextWrapper } from '@/application/Parser/Common/ContextualError';
import { errorWithContextWrapperStub } from '@tests/unit/shared/Stubs/ErrorWithContextWrapperStub';
import { itThrowsContextualError } from '@tests/unit/application/Parser/Common/ContextualErrorTester';
import type { FunctionParameterCollectionFactory } from '@/application/Parser/Executable/Script/Compiler/Function/Parameter/FunctionParameterCollectionFactory';
import { FunctionParameterCollectionStub } from '@tests/unit/shared/Stubs/FunctionParameterCollectionStub';
import type { FunctionCallsParser } from '@/application/Parser/Executable/Script/Compiler/Function/Call/FunctionCallsParser';
import { createFunctionCallsParserStub } from '@tests/unit/shared/Stubs/FunctionCallsParserStub';
import { FunctionCallStub } from '@tests/unit/shared/Stubs/FunctionCallStub';
import type { IReadOnlyFunctionParameterCollection } from '@/application/Parser/Executable/Script/Compiler/Function/Parameter/IFunctionParameterCollection';
import type { FunctionCall } from '@/application/Parser/Executable/Script/Compiler/Function/Call/FunctionCall';
import type { FunctionParameterParser } from '@/application/Parser/Executable/Script/Compiler/Function/Parameter/FunctionParameterParser';
import { createFunctionParameterParserStub } from '@tests/unit/shared/Stubs/FunctionParameterParserStub';
import { ScriptLanguage } from '@/domain/ScriptMetadata/ScriptLanguage';
import { CodeValidationRule } from '@/application/Parser/Executable/Script/Validation/CodeValidationRule';
import { expectCallsFunctionBody, expectCodeFunctionBody } from './ExpectFunctionBodyType';

describe('SharedFunctionsParser', () => {
  describe('parseSharedFunctions', () => {
    describe('validates functions', () => {
      it('throws when no name is provided', () => {
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
        const act = () => new TestContext()
          .withFunctions(invalidFunctions)
          .parseFunctions();
        // assert
        expect(act).to.throw(expectedError);
      });
      it('throws when functions have duplicate names', () => {
        // arrange
        const name = 'same-func-name';
        const expectedError = `duplicate function name: "${name}"`;
        const functions = [
          createFunctionDataWithCode().withName(name),
          createFunctionDataWithCode().withName(name),
        ];
        // act
        const act = () => new TestContext()
          .withFunctions(functions)
          .parseFunctions();
        // assert
        expect(act).to.throw(expectedError);
      });
      describe('throws when functions have duplicate code', () => {
        it('throws on code duplication', () => {
          // arrange
          const code = 'duplicate-code';
          const expectedError = `duplicate "code" in functions: "${code}"`;
          const functions = [
            createFunctionDataWithoutCallOrCode().withName('func-1').withCode(code),
            createFunctionDataWithoutCallOrCode().withName('func-2').withCode(code),
          ];
          // act
          const act = () => new TestContext()
            .withFunctions(functions)
            .parseFunctions();
          // assert
          expect(act).to.throw(expectedError);
        });
        it('throws on revert code duplication', () => {
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
          const act = () => new TestContext()
            .withFunctions(functions)
            .parseFunctions();
          // assert
          expect(act).to.throw(expectedError);
        });
      });
      describe('throws when both or neither code and call are defined', () => {
        it('throws when both code and call are defined', () => {
          // arrange
          const functionName = 'invalid-function';
          const expectedError = `both "code" and "call" are defined in "${functionName}"`;
          const invalidFunction = createFunctionDataWithoutCallOrCode()
            .withName(functionName)
            .withCode('code')
            .withMockCall();
          // act
          const act = () => new TestContext()
            .withFunctions([invalidFunction])
            .parseFunctions();
          // assert
          expect(act).to.throw(expectedError);
        });
        it('throws when neither code nor call is defined', () => {
          // arrange
          const functionName = 'invalid-function';
          const expectedError = `neither "code" or "call" is defined in "${functionName}"`;
          const invalidFunction = createFunctionDataWithoutCallOrCode()
            .withName(functionName);
          // act
          const act = () => new TestContext()
            .withFunctions([invalidFunction])
            .parseFunctions();
          // assert
          expect(act).to.throw(expectedError);
        });
      });
      describe('throws when parameter types are invalid', () => {
        const testScenarios: readonly {
          readonly description: string;
          readonly invalidType: unknown;
        }[] = [
          {
            description: 'parameter is not an array',
            invalidType: 5,
          },
          {
            description: 'parameter array contains non-objects',
            invalidType: ['a', { a: 'b' }],
          },
        ];
        for (const testCase of testScenarios) {
          it(testCase.description, () => {
            // arrange
            const func = createFunctionDataWithCode()
              .withParametersObject(testCase.invalidType as never);
            const expectedError = `parameters must be an array of objects in function(s) "${func.name}"`;
            // act
            const act = () => new TestContext()
              .withFunctions([func])
              .parseFunctions();
            // assert
            expect(act).to.throw(expectedError);
          });
        }
      });
      describe('code validation', () => {
        it('validates function code', () => {
          // arrange
          const expectedCode = 'expected code to be validated';
          const expectedRevertCode = 'expected revert code to be validated';
          const functionData = createFunctionDataWithCode()
            .withCode(expectedCode)
            .withRevertCode(expectedRevertCode);
          const expectedCodes: readonly string[] = [expectedCode, expectedRevertCode];
          const validator = new CodeValidatorStub();
          // act
          new TestContext()
            .withFunctions([functionData])
            .withValidator(validator.get())
            .parseFunctions();
          // assert
          validator.assertValidatedCodes(expectedCodes);
        });
        it('applies correct validation rules', () => {
          // arrange
          const expectedRules: readonly CodeValidationRule[] = [
            CodeValidationRule.NoEmptyLines,
            CodeValidationRule.NoDuplicatedLines,
          ];
          const functionData = createFunctionDataWithCode();
          const validator = new CodeValidatorStub();
          // act
          new TestContext()
            .withFunctions([functionData])
            .withValidator(validator.get())
            .parseFunctions();
          // assert
          validator.assertValidatedRules(expectedRules);
        });
        it('validates for correct scripting language', () => {
          // arrange
          const expectedLanguage: ScriptLanguage = ScriptLanguage.shellscript;
          const functionData = createFunctionDataWithCode();
          const validator = new CodeValidatorStub();
          // act
          new TestContext()
            .withFunctions([functionData])
            .withValidator(validator.get())
            .withLanguage(expectedLanguage)
            .parseFunctions();
          // assert
          validator.assertValidatedLanguage(expectedLanguage);
        });
      });
      describe('parameter creation', () => {
        describe('rethrows including function name when creating parameter throws', () => {
          // arrange
          const invalidParameterName = 'invalid-function-parameter-name';
          const functionName = 'functionName';
          const expectedErrorMessage = `Failed to create parameter: ${invalidParameterName} for function "${functionName}"`;
          const expectedInnerError = new Error('injected error');
          const parser: FunctionParameterParser = () => {
            throw expectedInnerError;
          };
          const functionData = createFunctionDataWithCode()
            .withName(functionName)
            .withParameters(new ParameterDefinitionDataStub().withName(invalidParameterName));
          itThrowsContextualError({
            // act
            throwingAction: (wrapError) => {
              new TestContext()
                .withFunctions([functionData])
                .withFunctionParameterParser(parser)
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
    describe('handles empty function data', () => {
      itEachAbsentCollectionValue<FunctionData>((absentValue) => {
        // act
        const actual = new TestContext()
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
        const collection = new TestContext()
          .withFunctions([expected])
          .parseFunctions();
        // expect
        const actual = collection.getFunctionByName(name);
        expectEqualName(expected, actual);
        expectEqualParameters(expected.parameters, actual.parameters);
        expectEqualFunctionWithInlineCode(expected, actual);
      });
    });
    describe('function with calls', () => {
      describe('parses single function correctly', () => {
        it('parses name correctly', () => {
          // arrange
          const expectedName = 'expected-function-name';
          const data = createFunctionDataWithCode()
            .withName(expectedName);
          // act
          const collection = new TestContext()
            .withFunctions([data])
            .parseFunctions();
          // expect
          const actual = collection.getFunctionByName(expectedName);
          expect(actual.name).to.equal(expectedName);
          expectEqualName(data, actual);
        });
        it('parses parameters correctly', () => {
          // arrange
          const functionCallsParserStub = createFunctionCallsParserStub();
          const expectedParameters: readonly ParameterDefinitionData[] = [
            new ParameterDefinitionDataStub().withName('expectedParameter').withOptionality(true),
            new ParameterDefinitionDataStub().withName('expectedParameter2').withOptionality(false),
          ];
          const data = createFunctionDataWithCode()
            .withParameters(...expectedParameters);
          // act
          const collection = new TestContext()
            .withFunctions([data])
            .withFunctionCallsParser(functionCallsParserStub.parser)
            .parseFunctions();
          // expect
          const actual = collection.getFunctionByName(data.name);
          expectEqualParameters(expectedParameters, actual.parameters);
        });
        it('parses call correctly', () => {
          // arrange
          const functionCallsParserStub = createFunctionCallsParserStub();
          const inputCallData = new FunctionCallDataStub()
            .withName('function-input-call');
          const data = createFunctionDataWithoutCallOrCode()
            .withCall(inputCallData);
          const expectedCall = new FunctionCallStub()
            .withFunctionName('function-expected-call');
          functionCallsParserStub.setup(inputCallData, [expectedCall]);
          // act
          const collection = new TestContext()
            .withFunctions([data])
            .withFunctionCallsParser(functionCallsParserStub.parser)
            .parseFunctions();
          // expect
          const actualFunction = collection.getFunctionByName(data.name);
          expectEqualFunctionWithCalls([expectedCall], actualFunction);
        });
      });
      describe('parses multiple functions correctly', () => {
        it('parses names correctly', () => {
          // arrange
          const expectedNames: readonly string[] = [
            'expected-function-name-1',
            'expected-function-name-2',
            'expected-function-name-3',
          ];
          const data: readonly FunctionData[] = expectedNames.map(
            (functionName) => createFunctionDataWithCall()
              .withName(functionName),
          );
          // act
          const collection = new TestContext()
            .withFunctions(data)
            .parseFunctions();
          // expect
          expectedNames.forEach((name, index) => {
            const compiledFunction = collection.getFunctionByName(name);
            expectEqualName(data[index], compiledFunction);
          });
        });
        it('parses parameters correctly', () => {
          // arrange
          const testData: readonly {
            readonly functionName: string;
            readonly inputParameterData: readonly ParameterDefinitionData[];
          }[] = [
            {
              functionName: 'func1',
              inputParameterData: [
                new ParameterDefinitionDataStub().withName('func1-first-parameter'),
                new ParameterDefinitionDataStub().withName('func1-second-parameter'),
              ],
            },
            {
              functionName: 'func2',
              inputParameterData: [
                new ParameterDefinitionDataStub().withName('func2-optional-parameter').withOptionality(true),
                new ParameterDefinitionDataStub().withName('func2-required-parameter').withOptionality(false),
              ],
            },
          ];
          const data: readonly FunctionData[] = testData.map(
            (d) => createFunctionDataWithCall()
              .withName(d.functionName)
              .withParameters(...d.inputParameterData),
          );
          // act
          const collection = new TestContext()
            .withFunctions(data)
            .parseFunctions();
          // expect
          testData.forEach(({ functionName, inputParameterData }) => {
            const actualFunction = collection.getFunctionByName(functionName);
            expectEqualParameters(inputParameterData, actualFunction.parameters);
          });
        });
        it('parses call correctly', () => {
          // arrange
          const functionCallsParserStub = createFunctionCallsParserStub();
          const callData: readonly {
            readonly functionName: string;
            readonly inputData: FunctionCallsData,
            readonly expectedCalls: ReturnType<FunctionCallsParser>,
          }[] = [
            {
              functionName: 'function-1',
              inputData: new FunctionCallDataStub().withName('function-1-input-function-call'),
              expectedCalls: [
                new FunctionCallStub().withFunctionName('function-1-compiled-function-call'),
              ],
            },
            {
              functionName: 'function-2',
              inputData: [
                new FunctionCallDataStub().withName('function-2-input-function-call-1'),
                new FunctionCallDataStub().withName('function-2-input-function-call-2'),
              ],
              expectedCalls: [
                new FunctionCallStub().withFunctionName('function-2-compiled-function-call-1'),
                new FunctionCallStub().withFunctionName('function-2-compiled-function-call-2'),
              ],
            },
          ];
          const data: readonly FunctionData[] = callData.map(
            ({ functionName, inputData }) => createFunctionDataWithoutCallOrCode()
              .withName(functionName)
              .withCall(inputData),
          );
          callData.forEach(({
            inputData,
            expectedCalls,
          }) => functionCallsParserStub.setup(inputData, expectedCalls));
          // act
          const collection = new TestContext()
            .withFunctions(data)
            .withFunctionCallsParser(functionCallsParserStub.parser)
            .parseFunctions();
          // expect
          callData.forEach(({ functionName, expectedCalls }) => {
            const actualFunction = collection.getFunctionByName(functionName);
            expectEqualFunctionWithCalls(expectedCalls, actualFunction);
          });
        });
      });
    });
  });
});

class TestContext {
  private language: ScriptLanguage = ScriptLanguage.batchfile;

  private codeValidator: CodeValidator = new CodeValidatorStub()
    .get();

  private functions: readonly FunctionData[] = [createFunctionDataWithCode()];

  private wrapError: ErrorWithContextWrapper = errorWithContextWrapperStub;

  private functionCallsParser: FunctionCallsParser = createFunctionCallsParserStub().parser;

  private functionParameterParser: FunctionParameterParser = createFunctionParameterParserStub;

  private parameterCollectionFactory
  : FunctionParameterCollectionFactory = () => new FunctionParameterCollectionStub();

  public withLanguage(language: ScriptLanguage): this {
    this.language = language;
    return this;
  }

  public withValidator(codeValidator: CodeValidator): this {
    this.codeValidator = codeValidator;
    return this;
  }

  public withFunctionCallsParser(functionCallsParser: FunctionCallsParser): this {
    this.functionCallsParser = functionCallsParser;
    return this;
  }

  public withFunctions(functions: readonly FunctionData[]): this {
    this.functions = functions;
    return this;
  }

  public withErrorWrapper(wrapError: ErrorWithContextWrapper): this {
    this.wrapError = wrapError;
    return this;
  }

  public withFunctionParameterParser(functionParameterParser: FunctionParameterParser): this {
    this.functionParameterParser = functionParameterParser;
    return this;
  }

  public withParameterCollectionFactory(
    parameterCollectionFactory: FunctionParameterCollectionFactory,
  ): this {
    this.parameterCollectionFactory = parameterCollectionFactory;
    return this;
  }

  public parseFunctions(): ReturnType<typeof parseSharedFunctions> {
    return parseSharedFunctions(
      this.functions,
      this.language,
      {
        codeValidator: this.codeValidator,
        wrapError: this.wrapError,
        parseParameter: this.functionParameterParser,
        createParameterCollection: this.parameterCollectionFactory,
        parseFunctionCalls: this.functionCallsParser,
      },
    );
  }
}

function expectEqualName(expected: FunctionData, actual: ISharedFunction): void {
  expect(actual.name).to.equal(expected.name);
}

function expectEqualParameters(
  expected: readonly ParameterDefinitionData[] | undefined,
  actual: IReadOnlyFunctionParameterCollection,
): void {
  const actualSimplifiedParameters = actual.all.map((parameter) => ({
    name: parameter.name,
    optional: parameter.isOptional,
  }));
  const expectedSimplifiedParameters = expected?.map((parameter) => ({
    name: parameter.name,
    optional: parameter.optional || false,
  })) || [];
  expect(expectedSimplifiedParameters).to.deep.equal(actualSimplifiedParameters, 'Unequal parameters');
}

function expectEqualFunctionWithInlineCode(
  expected: CodeInstruction,
  actual: ISharedFunction,
): void {
  expectCodeFunctionBody(actual.body);
  expect(actual.body.code, `function "${actual.name}" has no code`);
  expect(actual.body.code.execute).to.equal(expected.code);
  expect(actual.body.code.revert).to.equal(expected.revertCode);
}

function expectEqualFunctionWithCalls(
  expectedCalls: readonly FunctionCall[],
  actualFunction: ISharedFunction,
): void {
  expectCallsFunctionBody(actualFunction.body);
  const actualCalls = actualFunction.body.calls;
  expect(actualCalls.length).to.equal(expectedCalls.length);
  expect(actualCalls).to.have.members(expectedCalls);
}
