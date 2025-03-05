import { it, expect } from 'vitest';
import { ExpressionPosition } from '@/application/Application/Loader/Collections/Compiler/Executable/Script/Compiler/Expressions/Expression/ExpressionPosition';
import type { IExpressionParser } from '@/application/Application/Loader/Collections/Compiler/Executable/Script/Compiler/Expressions/Parser/IExpressionParser';
import { FunctionCallArgumentCollectionStub } from '@tests/unit/shared/Stubs/FunctionCallArgumentCollectionStub';
import { ExpressionEvaluationContextStub } from '@tests/unit/shared/Stubs/ExpressionEvaluationContextStub';
import { PipelineCompilerStub } from '@tests/unit/shared/Stubs/PipelineCompilerStub';
import { expectArrayEquals } from '@tests/shared/Assertions/ExpectArrayEquals';

export class SyntaxParserTestsRunner {
  constructor(private readonly sut: IExpressionParser) {
  }

  public expectPosition(...testCases: ExpectPositionTestScenario[]) {
    for (const testCase of testCases) {
      it(testCase.name, () => {
        // act
        const expressions = this.sut.findExpressions(testCase.code);
        // assert
        const actualPositions = expressions.map((e) => e.position);
        const expectedPositions = testCase.expected;
        expectArrayEquals(actualPositions, expectedPositions, {
          ignoreOrder: true,
          deep: true,
        });
      });
    }
    return this;
  }

  public expectNoMatch(...testCases: NoMatchTestScenario[]) {
    this.expectPosition(...testCases.map((testCase) => ({
      name: testCase.name,
      code: testCase.code,
      expected: [],
    })));
  }

  public expectResults(...testCases: ExpectResultTestScenario[]) {
    for (const testCase of testCases) {
      it(testCase.name, () => {
        // arrange
        const args = testCase.args(new FunctionCallArgumentCollectionStub());
        const context = new ExpressionEvaluationContextStub()
          .withArgs(args);
        // act
        const expressions = this.sut.findExpressions(testCase.code);
        // assert
        const actual = expressions.map((e) => e.evaluate(context));
        expect(actual).to.deep.equal(testCase.expected);
      });
    }
    return this;
  }

  public expectThrows(...testCases: ExpectThrowsTestScenario[]) {
    for (const testCase of testCases) {
      it(testCase.name, () => {
        // arrange
        const { expectedError } = testCase;
        // act
        const act = () => this.sut.findExpressions(testCase.code);
        // assert
        expect(act).to.throw(expectedError);
      });
    }
    return this;
  }

  public expectPipeHits(data: ExpectPipeHitTestScenario) {
    for (const validPipePart of PipeTestCases.ValidValues) {
      this.expectHitPipePart(validPipePart, data);
    }
    for (const invalidPipePart of PipeTestCases.InvalidValues) {
      this.expectMissPipePart(invalidPipePart, data);
    }
  }

  private expectHitPipePart(pipeline: string, data: ExpectPipeHitTestScenario) {
    it(`"${pipeline}" hits`, () => {
      // arrange
      const expectedPipePart = pipeline.trim();
      const code = data.codeBuilder(pipeline);
      const args = new FunctionCallArgumentCollectionStub()
        .withArgument(data.parameterName, data.parameterValue);
      const pipelineCompiler = new PipelineCompilerStub();
      const context = new ExpressionEvaluationContextStub()
        .withPipelineCompiler(pipelineCompiler)
        .withArgs(args);
      // act
      const expressions = this.sut.findExpressions(code);
      expressions[0].evaluate(context);
      // assert
      expect(expressions).has.lengthOf(1);
      expect(pipelineCompiler.compileHistory).has.lengthOf(1);
      const actualPipePart = pipelineCompiler.compileHistory[0].pipeline;
      const actualValue = pipelineCompiler.compileHistory[0].value;
      expect(actualPipePart).to.equal(expectedPipePart);
      expect(actualValue).to.equal(data.parameterValue);
    });
  }

  private expectMissPipePart(pipeline: string, data: ExpectPipeHitTestScenario) {
    it(`"${pipeline}" misses`, () => {
      // arrange
      const args = new FunctionCallArgumentCollectionStub()
        .withArgument(data.parameterName, data.parameterValue);
      const pipelineCompiler = new PipelineCompilerStub();
      const context = new ExpressionEvaluationContextStub()
        .withPipelineCompiler(pipelineCompiler)
        .withArgs(args);
      const code = data.codeBuilder(pipeline);
      // act
      const expressions = this.sut.findExpressions(code);
      expressions[0]?.evaluate(context); // Because an expression may include another with pipes
      // assert
      expect(pipelineCompiler.compileHistory).has.lengthOf(0);
    });
  }
}

export interface ExpectResultTestScenario {
  readonly name: string;
  readonly code: string;
  readonly args: (
    builder: FunctionCallArgumentCollectionStub,
  ) => FunctionCallArgumentCollectionStub;
  readonly expected: readonly string[];
}

interface ExpectThrowsTestScenario {
  readonly name: string;
  readonly code: string;
  readonly expectedError: string;
}

interface ExpectPositionTestScenario {
  readonly name: string;
  readonly code: string;
  readonly expected: readonly ExpressionPosition[];
}

interface NoMatchTestScenario {
  readonly name: string;
  readonly code: string;
}

interface ExpectPipeHitTestScenario {
  readonly codeBuilder: (pipeline: string) => string;
  readonly parameterName: string;
  readonly parameterValue: string;
}

const PipeTestCases = {
  ValidValues: [
    // Single pipe with different whitespace combinations
    ' | pipe', ' |pipe', '|pipe', ' |pipe', '   |   pipe',

    // Double pipes with different whitespace combinations
    ' | pipeFirst | pipeSecond', '| pipeFirst|pipeSecond', '|pipeFirst|pipeSecond', ' |pipeFirst |pipeSecond', '| pipeFirst | pipeSecond| pipeThird |pipeFourth',
  ],
  InvalidValues: [
    ' withoutPipeBefore  |pipe', ' withoutPipeBefore',

    // It's OK to match them (move to valid values if needed) to let compiler throw instead.
    '| pip€', '| pip{e} ', '| pipeWithNumber55', '| pipe with whitespace',
  ],
};
