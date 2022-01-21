import 'mocha';
import { expect } from 'chai';
import { FunctionCallParametersData } from 'js-yaml-loader!@/*';
import { FunctionCallCompiler } from '@/application/Parser/Script/Compiler/Function/Call/Compiler/FunctionCallCompiler';
import { ISharedFunctionCollection } from '@/application/Parser/Script/Compiler/Function/ISharedFunctionCollection';
import { IExpressionsCompiler } from '@/application/Parser/Script/Compiler/Expressions/IExpressionsCompiler';
import { SharedFunctionCollectionStub } from '@tests/unit/stubs/SharedFunctionCollectionStub';
import { FunctionBodyType } from '@/application/Parser/Script/Compiler/Function/ISharedFunction';
import { SharedFunctionStub } from '@tests/unit/stubs/SharedFunctionStub';
import { FunctionCallArgumentCollectionStub } from '@tests/unit/stubs/FunctionCallArgumentCollectionStub';
import { FunctionCallStub } from '@tests/unit/stubs/FunctionCallStub';
import { ExpressionsCompilerStub } from '@tests/unit/stubs/ExpressionsCompilerStub';
import { itEachAbsentObjectValue } from '@tests/unit/shared/TestCases/AbsentTests';

describe('FunctionCallCompiler', () => {
  describe('compileCall', () => {
    describe('parameter validation', () => {
      describe('call', () => {
        describe('throws with missing call', () => {
          itEachAbsentObjectValue((absentValue) => {
            // arrange
            const expectedError = 'missing calls';
            const call = absentValue;
            const functions = new SharedFunctionCollectionStub();
            const sut = new MockableFunctionCallCompiler();
            // act
            const act = () => sut.compileCall(call, functions);
            // assert
            expect(act).to.throw(expectedError);
          });
        });
        describe('throws if call sequence has absent call', () => {
          itEachAbsentObjectValue((absentValue) => {
            // arrange
            const expectedError = 'missing function call';
            const call = [
              new FunctionCallStub(),
              absentValue,
            ];
            const functions = new SharedFunctionCollectionStub();
            const sut = new MockableFunctionCallCompiler();
            // act
            const act = () => sut.compileCall(call, functions);
            // assert
            expect(act).to.throw(expectedError);
          });
        });
        describe('throws if call parameters does not match function parameters', () => {
          // arrange
          const functionName = 'test-function-name';
          const testCases = [
            {
              name: 'provided: single unexpected parameter, when: another expected',
              functionParameters: ['expected-parameter'],
              callParameters: ['unexpected-parameter'],
              expectedError:
                `Function "${functionName}" has unexpected parameter(s) provided: "unexpected-parameter"`
                  + '. Expected parameter(s): "expected-parameter"',
            },
            {
              name: 'provided: multiple unexpected parameters, when: different one is expected',
              functionParameters: ['expected-parameter'],
              callParameters: ['unexpected-parameter1', 'unexpected-parameter2'],
              expectedError:
                `Function "${functionName}" has unexpected parameter(s) provided: "unexpected-parameter1", "unexpected-parameter2"`
                  + '. Expected parameter(s): "expected-parameter"',
            },
            {
              name: 'provided: an unexpected parameter, when: multiple parameters are expected',
              functionParameters: ['expected-parameter1', 'expected-parameter2'],
              callParameters: ['expected-parameter1', 'expected-parameter2', 'unexpected-parameter'],
              expectedError:
                `Function "${functionName}" has unexpected parameter(s) provided: "unexpected-parameter"`
                  + '. Expected parameter(s): "expected-parameter1", "expected-parameter2"',
            },
            {
              name: 'provided: an unexpected parameter, when: none required',
              functionParameters: [],
              callParameters: ['unexpected-call-parameter'],
              expectedError:
                `Function "${functionName}" has unexpected parameter(s) provided: "unexpected-call-parameter"`
                  + '. Expected parameter(s): none',
            },
            {
              name: 'provided: expected and unexpected parameter, when: one of them is expected',
              functionParameters: ['expected-parameter'],
              callParameters: ['expected-parameter', 'unexpected-parameter'],
              expectedError:
                `Function "${functionName}" has unexpected parameter(s) provided: "unexpected-parameter"`
                  + '. Expected parameter(s): "expected-parameter"',
            },
          ];
          for (const testCase of testCases) {
            it(testCase.name, () => {
              const func = new SharedFunctionStub(FunctionBodyType.Code)
                .withName('test-function-name')
                .withParameterNames(...testCase.functionParameters);
              const params = testCase.callParameters
                .reduce((result, parameter) => {
                  return { ...result, [parameter]: 'defined-parameter-value ' };
                }, {} as FunctionCallParametersData);
              const call = new FunctionCallStub()
                .withFunctionName(func.name)
                .withArguments(params);
              const functions = new SharedFunctionCollectionStub()
                .withFunction(func);
              const sut = new MockableFunctionCallCompiler();
              // act
              const act = () => sut.compileCall([call], functions);
              // assert
              expect(act).to.throw(testCase.expectedError);
            });
          }
        });
      });
      describe('functions', () => {
        describe('throws with missing functions', () => {
          itEachAbsentObjectValue((absentValue) => {
            // arrange
            const expectedError = 'missing functions';
            const call = new FunctionCallStub();
            const functions = absentValue;
            const sut = new MockableFunctionCallCompiler();
            // act
            const act = () => sut.compileCall([call], functions);
            // assert
            expect(act).to.throw(expectedError);
          });
        });
        it('throws if function does not exist', () => {
          // arrange
          const expectedError = 'function does not exist';
          const call = new FunctionCallStub();
          const functions: ISharedFunctionCollection = {
            getFunctionByName: () => { throw new Error(expectedError); },
          };
          const sut = new MockableFunctionCallCompiler();
          // act
          const act = () => sut.compileCall([call], functions);
          // assert
          expect(act).to.throw(expectedError);
        });
      });
    });
    describe('builds code as expected', () => {
      describe('builds single call as expected', () => {
        // arrange
        const parametersTestCases = [
          {
            name: 'empty parameters',
            parameters: [],
            callArgs: { },
          },
          {
            name: 'non-empty parameters',
            parameters: ['param1', 'param2'],
            callArgs: { param1: 'value1', param2: 'value2' },
          },
        ];
        for (const testCase of parametersTestCases) {
          it(testCase.name, () => {
            const expected = {
              execute: 'expected code (execute)',
              revert: 'expected code (revert)',
            };
            const func = new SharedFunctionStub(FunctionBodyType.Code)
              .withParameterNames(...testCase.parameters);
            const functions = new SharedFunctionCollectionStub().withFunction(func);
            const call = new FunctionCallStub()
              .withFunctionName(func.name)
              .withArguments(testCase.callArgs);
            const args = new FunctionCallArgumentCollectionStub().withArguments(testCase.callArgs);
            const { code } = func.body;
            const expressionsCompilerMock = new ExpressionsCompilerStub()
              .setup({ givenCode: code.do, givenArgs: args, result: expected.execute })
              .setup({ givenCode: code.revert, givenArgs: args, result: expected.revert });
            const sut = new MockableFunctionCallCompiler(expressionsCompilerMock);
            // act
            const actual = sut.compileCall([call], functions);
            // assert
            expect(actual.code).to.equal(expected.execute);
            expect(actual.revertCode).to.equal(expected.revert);
          });
        }
      });
      it('builds call sequence as expected', () => {
        // arrange
        const firstFunction = new SharedFunctionStub(FunctionBodyType.Code)
          .withName('first-function-name')
          .withCode('first-function-code')
          .withRevertCode('first-function-revert-code');
        const secondFunction = new SharedFunctionStub(FunctionBodyType.Code)
          .withName('second-function-name')
          .withParameterNames('testParameter')
          .withCode('second-function-code')
          .withRevertCode('second-function-revert-code');
        const secondCallArguments = { testParameter: 'testValue' };
        const calls = [
          new FunctionCallStub()
            .withFunctionName(firstFunction.name)
            .withArguments({}),
          new FunctionCallStub()
            .withFunctionName(secondFunction.name)
            .withArguments(secondCallArguments),
        ];
        const firstFunctionCallArgs = new FunctionCallArgumentCollectionStub();
        const secondFunctionCallArgs = new FunctionCallArgumentCollectionStub()
          .withArguments(secondCallArguments);
        const expressionsCompilerMock = new ExpressionsCompilerStub()
          .setupToReturnFunctionCode(firstFunction, firstFunctionCallArgs)
          .setupToReturnFunctionCode(secondFunction, secondFunctionCallArgs);
        const expectedExecute = `${firstFunction.body.code.do}\n${secondFunction.body.code.do}`;
        const expectedRevert = `${firstFunction.body.code.revert}\n${secondFunction.body.code.revert}`;
        const functions = new SharedFunctionCollectionStub()
          .withFunction(firstFunction)
          .withFunction(secondFunction);
        const sut = new MockableFunctionCallCompiler(expressionsCompilerMock);
        // act
        const actual = sut.compileCall(calls, functions);
        // assert
        expect(actual.code).to.equal(expectedExecute);
        expect(actual.revertCode).to.equal(expectedRevert);
      });
      describe('can compile a call tree (function calling another)', () => {
        describe('single deep function call', () => {
          it('builds 2nd level of depth without arguments', () => {
            // arrange
            const emptyArgs = new FunctionCallArgumentCollectionStub();
            const deepFunctionName = 'deepFunction';
            const functions = {
              deep: new SharedFunctionStub(FunctionBodyType.Code)
                .withName(deepFunctionName)
                .withCode('deep function code')
                .withRevertCode('deep function final code'),
              front: new SharedFunctionStub(FunctionBodyType.Calls)
                .withName('frontFunction')
                .withCalls(new FunctionCallStub()
                  .withFunctionName(deepFunctionName)
                  .withArgumentCollection(emptyArgs)),
            };
            const expected = {
              code: 'final code',
              revert: 'final revert code',
            };
            const expressionsCompilerMock = new ExpressionsCompilerStub()
              .setup({
                givenCode: functions.deep.body.code.do,
                givenArgs: emptyArgs,
                result: expected.code,
              })
              .setup({
                givenCode: functions.deep.body.code.revert,
                givenArgs: emptyArgs,
                result: expected.revert,
              });
            const mainCall = new FunctionCallStub()
              .withFunctionName(functions.front.name)
              .withArgumentCollection(emptyArgs);
            const sut = new MockableFunctionCallCompiler(expressionsCompilerMock);
            // act
            const actual = sut.compileCall(
              [mainCall],
              new SharedFunctionCollectionStub().withFunction(functions.deep, functions.front),
            );
            // assert
            expect(actual.code).to.equal(expected.code);
            expect(actual.revertCode).to.equal(expected.revert);
          });
          it('builds 2nd level of depth by compiling arguments', () => {
            // arrange
            const scenario = {
              front: {
                functionName: 'frontFunction',
                parameterName: 'frontFunctionParameterName',
                args: {
                  fromMainCall: 'initial argument to be compiled',
                  toNextStatic: 'value from "front" to "deep" in function definition',
                  toNextCompiled: 'argument from "front" to "deep" (compiled)',
                },
                callArgs: {
                  initialFromMainCall: () => new FunctionCallArgumentCollectionStub()
                    .withArgument(scenario.front.parameterName, scenario.front.args.fromMainCall),
                  expectedCallDeep: () => new FunctionCallArgumentCollectionStub()
                    .withArgument(scenario.deep.parameterName, scenario.front.args.toNextCompiled),
                },
                getFunction: () => new SharedFunctionStub(FunctionBodyType.Calls)
                  .withName(scenario.front.functionName)
                  .withParameterNames(scenario.front.parameterName)
                  .withCalls(new FunctionCallStub()
                    .withFunctionName(scenario.deep.functionName)
                    .withArgument(scenario.deep.parameterName, scenario.front.args.toNextStatic)),
              },
              deep: {
                functionName: 'deepFunction',
                parameterName: 'deepFunctionParameterName',
                getFunction: () => new SharedFunctionStub(FunctionBodyType.Code)
                  .withName(scenario.deep.functionName)
                  .withParameterNames(scenario.deep.parameterName)
                  .withCode(`${scenario.deep.functionName} function code`)
                  .withRevertCode(`${scenario.deep.functionName} function revert code`),
              },
            };
            const expected = {
              code: 'final code',
              revert: 'final revert code',
            };
            const expressionsCompilerMock = new ExpressionsCompilerStub()
              .setup({ // Front ===args===> Deep
                givenCode: scenario.front.args.toNextStatic,
                givenArgs: scenario.front.callArgs.initialFromMainCall(),
                result: scenario.front.args.toNextCompiled,
              })
            // set-up compiling of deep, compiled argument should be sent
              .setup({
                givenCode: scenario.deep.getFunction().body.code.do,
                givenArgs: scenario.front.callArgs.expectedCallDeep(),
                result: expected.code,
              })
              .setup({
                givenCode: scenario.deep.getFunction().body.code.revert,
                givenArgs: scenario.front.callArgs.expectedCallDeep(),
                result: expected.revert,
              });
            const sut = new MockableFunctionCallCompiler(expressionsCompilerMock);
            // act
            const actual = sut.compileCall(
              [
                new FunctionCallStub()
                  .withFunctionName(scenario.front.functionName)
                  .withArgumentCollection(scenario.front.callArgs.initialFromMainCall()),
              ],
              new SharedFunctionCollectionStub().withFunction(
                scenario.deep.getFunction(),
                scenario.front.getFunction(),
              ),
            );
            // assert
            expect(actual.code).to.equal(expected.code);
            expect(actual.revertCode).to.equal(expected.revert);
          });
          it('builds 3rd level of depth by compiling arguments', () => {
            // arrange
            const scenario = {
              first: {
                functionName: 'firstFunction',
                parameter: 'firstParameter',
                args: {
                  fromMainCall: 'initial argument to be compiled',
                  toNextStatic: 'value from "first" to "second" in function definition',
                  toNextCompiled: 'argument from "first" to "second" (compiled)',
                },
                callArgs: {
                  initialFromMainCall: () => new FunctionCallArgumentCollectionStub()
                    .withArgument(scenario.first.parameter, scenario.first.args.fromMainCall),
                  expectedToSecond: () => new FunctionCallArgumentCollectionStub()
                    .withArgument(scenario.second.parameter, scenario.first.args.toNextCompiled),
                },
                getFunction: () => new SharedFunctionStub(FunctionBodyType.Calls)
                  .withName(scenario.first.functionName)
                  .withParameterNames(scenario.first.parameter)
                  .withCalls(new FunctionCallStub()
                    .withFunctionName(scenario.second.functionName)
                    .withArgument(scenario.second.parameter, scenario.first.args.toNextStatic)),
              },
              second: {
                functionName: 'secondFunction',
                parameter: 'secondParameter',
                args: {
                  toNextCompiled: 'argument second to third (compiled)',
                  toNextStatic: 'calling second to third',
                },
                callArgs: {
                  expectedToThird: () => new FunctionCallArgumentCollectionStub()
                    .withArgument(scenario.third.parameter, scenario.second.args.toNextCompiled),
                },
                getFunction: () => new SharedFunctionStub(FunctionBodyType.Calls)
                  .withName(scenario.second.functionName)
                  .withParameterNames(scenario.second.parameter)
                  .withCalls(new FunctionCallStub()
                    .withFunctionName(scenario.third.functionName)
                    .withArgument(scenario.third.parameter, scenario.second.args.toNextStatic)),
              },
              third: {
                functionName: 'thirdFunction',
                parameter: 'thirdParameter',
                getFunction: () => new SharedFunctionStub(FunctionBodyType.Code)
                  .withName(scenario.third.functionName)
                  .withParameterNames(scenario.third.parameter)
                  .withCode(`${scenario.third.functionName} function code`)
                  .withRevertCode(`${scenario.third.functionName} function revert code`),
              },
            };
            const expected = {
              code: 'final code',
              revert: 'final revert code',
            };
            const expressionsCompilerMock = new ExpressionsCompilerStub()
              .setup({ // First ===args===> Second
                givenCode: scenario.first.args.toNextStatic,
                givenArgs: scenario.first.callArgs.initialFromMainCall(),
                result: scenario.first.args.toNextCompiled,
              })
              .setup({ // Second ===args===> third
                givenCode: scenario.second.args.toNextStatic,
                givenArgs: scenario.first.callArgs.expectedToSecond(),
                result: scenario.second.args.toNextCompiled,
              })
            // Compiling of third functions code with expected arguments
              .setup({
                givenCode: scenario.third.getFunction().body.code.do,
                givenArgs: scenario.second.callArgs.expectedToThird(),
                result: expected.code,
              })
              .setup({
                givenCode: scenario.third.getFunction().body.code.revert,
                givenArgs: scenario.second.callArgs.expectedToThird(),
                result: expected.revert,
              });
            const sut = new MockableFunctionCallCompiler(expressionsCompilerMock);
            const mainCall = new FunctionCallStub()
              .withFunctionName(scenario.first.functionName)
              .withArgumentCollection(scenario.first.callArgs.initialFromMainCall());
            // act
            const actual = sut.compileCall(
              [mainCall],
              new SharedFunctionCollectionStub().withFunction(
                scenario.first.getFunction(),
                scenario.second.getFunction(),
                scenario.third.getFunction(),
              ),
            );
            // assert
            expect(actual.code).to.equal(expected.code);
            expect(actual.revertCode).to.equal(expected.revert);
          });
        });
        describe('multiple deep function calls', () => {
          it('builds 2nd level of depth without arguments', () => {
            // arrange
            const emptyArgs = new FunctionCallArgumentCollectionStub();
            const functions = {
              call1: {
                deep: {
                  functionName: 'deepFunction',
                  getFunction: () => new SharedFunctionStub(FunctionBodyType.Code)
                    .withName(functions.call1.deep.functionName)
                    .withCode('deep function (1) code')
                    .withRevertCode('deep function (1) final code'),
                },
                front: {
                  getFunction: () => new SharedFunctionStub(FunctionBodyType.Calls)
                    .withName('frontFunction')
                    .withCalls(new FunctionCallStub()
                      .withFunctionName(functions.call1.deep.functionName)
                      .withArgumentCollection(emptyArgs)),
                },
              },
              call2: {
                deep: {
                  functionName: 'deepFunction2',
                  getFunction: () => new SharedFunctionStub(FunctionBodyType.Code)
                    .withName(functions.call2.deep.functionName)
                    .withCode('deep function (2) code')
                    .withRevertCode('deep function (2) final code'),
                },
                front: {
                  getFunction: () => new SharedFunctionStub(FunctionBodyType.Calls)
                    .withName('frontFunction2')
                    .withCalls(new FunctionCallStub()
                      .withFunctionName(functions.call2.deep.functionName)
                      .withArgumentCollection(emptyArgs)),
                },
              },
              getMainCall: () => [
                new FunctionCallStub()
                  .withFunctionName(functions.call1.front.getFunction().name)
                  .withArgumentCollection(emptyArgs),
                new FunctionCallStub()
                  .withFunctionName(functions.call2.front.getFunction().name)
                  .withArgumentCollection(emptyArgs),
              ],
              getCollection: () => new SharedFunctionCollectionStub().withFunction(
                functions.call1.deep.getFunction(),
                functions.call1.front.getFunction(),
                functions.call2.deep.getFunction(),
                functions.call2.front.getFunction(),
              ),
            };
            const expressionsCompilerMock = new ExpressionsCompilerStub()
              .setupToReturnFunctionCode(functions.call1.deep.getFunction(), emptyArgs)
              .setupToReturnFunctionCode(functions.call2.deep.getFunction(), emptyArgs);
            const sut = new MockableFunctionCallCompiler(expressionsCompilerMock);
            const expected = {
              code: `${functions.call1.deep.getFunction().body.code.do}\n${functions.call2.deep.getFunction().body.code.do}`,
              revert: `${functions.call1.deep.getFunction().body.code.revert}\n${functions.call2.deep.getFunction().body.code.revert}`,
            };
            // act
            const actual = sut.compileCall(
              functions.getMainCall(),
              functions.getCollection(),
            );
            // assert
            expect(actual.code).to.equal(expected.code);
            expect(actual.revertCode).to.equal(expected.revert);
          });
        });
      });
    });
  });
});

class MockableFunctionCallCompiler extends FunctionCallCompiler {
  constructor(expressionsCompiler: IExpressionsCompiler = new ExpressionsCompilerStub()) {
    super(expressionsCompiler);
  }
}
