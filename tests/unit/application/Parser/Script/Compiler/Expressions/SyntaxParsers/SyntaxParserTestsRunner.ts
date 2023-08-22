import { it, expect } from 'vitest';
import { ExpressionPosition } from '@/application/Parser/Script/Compiler/Expressions/Expression/ExpressionPosition';
import { IExpressionParser } from '@/application/Parser/Script/Compiler/Expressions/Parser/IExpressionParser';
import { FunctionCallArgumentCollectionStub } from '@tests/unit/shared/Stubs/FunctionCallArgumentCollectionStub';
import { ExpressionEvaluationContextStub } from '@tests/unit/shared/Stubs/ExpressionEvaluationContextStub';
import { PipelineCompilerStub } from '@tests/unit/shared/Stubs/PipelineCompilerStub';

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

  public expectNoMatch(...testCases: INoMatchTestCase[]) {
    this.expectPosition(...testCases.map((testCase) => ({
      name: testCase.name,
      code: testCase.code,
      expected: [],
    })));
  }

  public expectResults(...testCases: IExpectResultTestCase[]) {
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

  public expectPipeHits(data: IExpectPipeHitTestData) {
    for (const validPipePart of PipeTestCases.ValidValues) {
      this.expectHitPipePart(validPipePart, data);
    }
    for (const invalidPipePart of PipeTestCases.InvalidValues) {
      this.expectMissPipePart(invalidPipePart, data);
    }
  }

  private expectHitPipePart(pipeline: string, data: IExpectPipeHitTestData) {
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
      const actualPipeNames = pipelineCompiler.compileHistory[0].pipeline;
      const actualValue = pipelineCompiler.compileHistory[0].value;
      expect(actualPipeNames).to.equal(expectedPipePart);
      expect(actualValue).to.equal(data.parameterValue);
    });
  }

  private expectMissPipePart(pipeline: string, data: IExpectPipeHitTestData) {
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

interface INoMatchTestCase {
  name: string;
  code: string;
}

interface IExpectPipeHitTestData {
  codeBuilder: (pipeline: string) => string;
  parameterName: string;
  parameterValue: string;
}

const PipeTestCases = {
  ValidValues: [
    // Single pipe with different whitespace combinations
    ' | pipe1', ' |pipe1', '|pipe1', ' |pipe1', '   |   pipe1',

    // Double pipes with different whitespace combinations
    ' | pipe1 | pipe2', '| pipe1|pipe2', '|pipe1|pipe2', ' |pipe1 |pipe2', '| pipe1 | pipe2| pipe3 |pipe4',

    // Wrong cases, but should match anyway and let pipelineCompiler throw errors
    '| pip€', '| pip{e} ',
  ],
  InvalidValues: [
    ' pipe1  |pipe2', ' pipe1',
  ],
};
