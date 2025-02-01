import { describe, it, expect } from 'vitest';
import { createScriptCompiler } from '@/application/Application/Loader/Collections/Compiler/Executable/Script/Compiler/ScriptCompilerFactory';
import { ScriptLanguage } from '@/domain/ScriptMetadata/ScriptLanguage';
import type { FunctionData, ParameterDefinitionData, FunctionCallParametersData } from '@/application/collections/';
import type { ScriptCompiler } from '@/application/Application/Loader/Collections/Compiler/Executable/Script/Compiler/ScriptCompiler';
import { collectExceptionMessage } from '@tests/unit/shared/ExceptionCollector';
import { formatAssertionMessage } from '@tests/shared/FormatAssertionMessage';
import { indentText } from '@/application/Common/Text/IndentText';

describe('ScriptCompiler', () => {
  describe('missing argument validation', () => {
    describe('throws when missing parameter values', () => {
      const testScenarios: readonly {
        readonly description: string;
        readonly isParameterOptional: boolean;
      }[] = [
        {
          description: 'for required parameters',
          isParameterOptional: false,
        },
        {
          description: 'for optional parameters',
          isParameterOptional: true,
        },
      ];
      testScenarios.forEach((test) => {
        it(test.description, () => {
          // arrange
          const expectedErrorPart = 'parameters missing values';
          const parameterNames = {
            withArgument: 'optionalParamWithValue',
            withNoArgument: 'optionalParamWithNoValue',
          };
          const context = new TestContext()
            .withCodeLines([
              `Parameter with value (should not fail): {{ $${parameterNames.withArgument} }}`,
              `Parameter with no value (should fail):  {{ $${parameterNames.withNoArgument} }}`,
            ])
            .withParameters([
              { name: parameterNames.withArgument, optional: test.isParameterOptional },
              { name: parameterNames.withNoArgument, optional: test.isParameterOptional },
            ])
            .withArguments({
              [parameterNames.withArgument]: 'value',
            });
          // act
          const act = () => context.compile();
          // assert
          const errorMessage = collectExceptionMessage(act);
          expect(errorMessage).to.include(expectedErrorPart, formatAssertionMessage([
            'Error message should indicate missing parameter values',
            `Expected to find: "${expectedErrorPart}"`,
            'Actual error message:',
            indentText(errorMessage),
          ]));
          expect(errorMessage).to.include(parameterNames.withNoArgument, formatAssertionMessage([
            'Error message should mention the missing parameter',
            `Missing parameter: "${parameterNames.withNoArgument}"`,
            'Actual error message:',
            indentText(errorMessage),
          ]));
          expect(errorMessage).to.not.include(parameterNames.withArgument, formatAssertionMessage([
            'Error message should not mention parameters with values',
            `Parameter with value: "${parameterNames.withArgument}"`,
            'Actual error message:',
            indentText(errorMessage),
          ]));
        });
      });
    });
    it('allows conditional usage of optional parameters', () => {
      // arrange
      const parameterName = 'optionalParam';
      const context = new TestContext()
        .withCodeLines([
          `Hello {{ with $${parameterName} }}`,
          `  sir {{ $${parameterName} }}!`,
          '{{ end }}',
        ])
        .withParameters([
          { name: parameterName, optional: true },
        ])
        .withArguments({
          // No value provided
        });
      // act
      const act = () => context.compile();
      // assert
      expect(act).to.not.throw(formatAssertionMessage([
        'Optional parameters in conditional blocks should not trigger validation errors',
        `Parameter name: "${parameterName}"`,
        'Context: Parameter is used inside a conditional block ({{ with ... }} {{ end }})',
      ]));
    });
  });
});

class TestContext {
  private language: ScriptLanguage = ScriptLanguage.batchfile;

  private args?: FunctionCallParametersData = undefined;

  private parameters: readonly ParameterDefinitionData[] = [];

  private code: string = `[${TestContext.name}] Test code`;

  private withCode(code: string): this {
    this.code = code;
    return this;
  }

  public withCodeLines(codeLines: readonly string[]): this {
    return this.withCode(codeLines.join('\n'));
  }

  public withParameters(parameters: readonly ParameterDefinitionData[]): this {
    this.parameters = parameters;
    return this;
  }

  public withArguments(args: FunctionCallParametersData): this {
    this.args = args;
    return this;
  }

  public compile(): ReturnType<ScriptCompiler['compile']> {
    const wrapperFunctionName = 'testFunction';
    const wrapperFunction: FunctionData = {
      name: wrapperFunctionName,
      code: this.code,
      parameters: this.parameters,
    };
    const compiler = createScriptCompiler({
      categoryContext: {
        functions: [wrapperFunction],
        language: this.language,
      },
    });
    return compiler.compile({
      name: 'Script under test',
      call: {
        function: wrapperFunctionName,
        parameters: this.args,
      },
    });
  }
}
