import { describe, it, expect } from 'vitest';
import { PipelineCompiler } from '@/application/Parser/Script/Compiler/Expressions/Pipes/PipelineCompiler';
import { type IPipelineCompiler } from '@/application/Parser/Script/Compiler/Expressions/Pipes/IPipelineCompiler';
import type { IPipeFactory } from '@/application/Parser/Script/Compiler/Expressions/Pipes/PipeFactory';
import { PipeStub } from '@tests/unit/shared/Stubs/PipeStub';
import { PipeFactoryStub } from '@tests/unit/shared/Stubs/PipeFactoryStub';
import { getAbsentStringTestCases } from '@tests/unit/shared/TestCases/AbsentTests';

describe('PipelineCompiler', () => {
  describe('compile', () => {
    describe('throws for invalid arguments', () => {
      interface ITestCase {
        readonly name: string;
        readonly act: (test: PipelineTestRunner) => PipelineTestRunner;
        readonly expectedError: string;
      }
      const testCases: ITestCase[] = [
        ...getAbsentStringTestCases({ excludeNull: true, excludeUndefined: true })
          .map((testCase) => ({
            name: `"value" is ${testCase.valueName}`,
            act: (test) => test.withValue(testCase.absentValue),
            expectedError: 'missing value',
          })),
        ...getAbsentStringTestCases({ excludeNull: true, excludeUndefined: true })
          .map((testCase) => ({
            name: `"pipeline" is ${testCase.valueName}`,
            act: (test) => test.withPipeline(testCase.absentValue),
            expectedError: 'missing pipeline',
          })),
        {
          name: '"pipeline" does not start with pipe',
          act: (test) => test.withPipeline('pipeline |'),
          expectedError: 'pipeline does not start with pipe',
        },
      ];
      for (const testCase of testCases) {
        it(testCase.name, () => {
          // act
          const runner = new PipelineTestRunner();
          testCase.act(runner);
          const act = () => runner.compile();
          // assert
          expect(act).to.throw(testCase.expectedError);
        });
      }
    });
    describe('compiles pipeline as expected', () => {
      const testCases = [
        {
          name: 'compiles single pipe as expected',
          pipes: [
            new PipeStub().withName('doublePrint').withApplier((value) => `${value}-${value}`),
          ],
          pipeline: '| doublePrint',
          value: 'value',
          expected: 'value-value',
        },
        {
          name: 'compiles multiple pipes as expected',
          pipes: [
            new PipeStub().withName('prependLetterA').withApplier((value) => `A-${value}`),
            new PipeStub().withName('prependLetterB').withApplier((value) => `B-${value}`),
          ],
          pipeline: '| prependLetterA | prependLetterB',
          value: 'value',
          expected: 'B-A-value',
        },
        {
          name: 'compiles with relaxed whitespace placing',
          pipes: [
            new PipeStub().withName('appendNumberOne').withApplier((value) => `${value}1`),
            new PipeStub().withName('appendNumberTwo').withApplier((value) => `${value}2`),
            new PipeStub().withName('appendNumberThree').withApplier((value) => `${value}3`),
          ],
          pipeline: ' |      appendNumberOne|appendNumberTwo|   appendNumberThree',
          value: 'value',
          expected: 'value123',
        },
        {
          name: 'can reuse same pipe',
          pipes: [
            new PipeStub().withName('removeFirstChar').withApplier((value) => `${value.slice(1)}`),
          ],
          pipeline: ' | removeFirstChar | removeFirstChar | removeFirstChar',
          value: 'value',
          expected: 'ue',
        },
      ];
      for (const testCase of testCases) {
        it(testCase.name, () => {
          // arrange
          const runner = new PipelineTestRunner()
            .withValue(testCase.value)
            .withPipeline(testCase.pipeline)
            .withFactory(new PipeFactoryStub().withPipes(testCase.pipes));
          // act
          const actual = runner.compile();
          // expect
          expect(actual).to.equal(testCase.expected);
        });
      }
    });
  });
});

class PipelineTestRunner implements IPipelineCompiler {
  private value = 'non-empty-value';

  private pipeline = '| validPipeline';

  private factory: IPipeFactory = new PipeFactoryStub();

  public withValue(value: string) {
    this.value = value;
    return this;
  }

  public withPipeline(pipeline: string) {
    this.pipeline = pipeline;
    return this;
  }

  public withFactory(factory: IPipeFactory) {
    this.factory = factory;
    return this;
  }

  public compile(): string {
    const sut = new PipelineCompiler(this.factory);
    return sut.compile(this.value, this.pipeline);
  }
}
