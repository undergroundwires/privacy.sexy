import { it, expect } from 'vitest';
import type { IPipe } from '@/application/Parser/Executable/Script/Compiler/Expressions/Pipes/IPipe';

export interface IPipeTestCase {
  readonly name: string;
  readonly input: string;
  readonly expectedOutput: string;
}

export function runPipeTests(sut: IPipe, testCases: IPipeTestCase[]) {
  for (const testCase of testCases) {
    it(testCase.name, () => {
      // act
      const actual = sut.apply(testCase.input);
      // assert
      expect(actual).to.equal(testCase.expectedOutput);
    });
  }
}
