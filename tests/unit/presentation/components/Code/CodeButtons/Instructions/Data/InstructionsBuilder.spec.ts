import { describe, it, expect } from 'vitest';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { IInstructionsBuilderData, InstructionsBuilder, InstructionStepBuilderType } from '@/presentation/components/Code/CodeButtons/Instructions/Data/InstructionsBuilder';
import { itEachAbsentObjectValue } from '@tests/unit/shared/TestCases/AbsentTests';
import { IInstructionInfo, IInstructionListStep } from '@/presentation/components/Code/CodeButtons/Instructions/InstructionListData';

describe('InstructionsBuilder', () => {
  describe('withStep', () => {
    describe('throws when step is missing', () => {
      itEachAbsentObjectValue((absentValue) => {
        // arrange
        const expectedError = 'missing stepBuilder';
        const data = absentValue;
        const sut = new InstructionsBuilder(OperatingSystem.Linux);
        // act
        const act = () => sut.withStep(data);
        // assert
        expect(act).to.throw(expectedError);
      });
    });
  });
  describe('build', () => {
    it('builds with given data', () => {
      // arrange
      const expectedData = createMockData();
      const actualData = Array<IInstructionsBuilderData>();
      const builder = new InstructionsBuilder(OperatingSystem.Android);
      const steps: readonly InstructionStepBuilderType[] = [createMockStep(), createMockStep()]
        .map((step) => (data) => {
          actualData.push(data);
          return step;
        });
      for (const step of steps) {
        builder.withStep(step);
      }
      // act
      builder.build(expectedData);
      // assert
      expect(actualData.every((data) => data === expectedData));
    });
    it('builds with every step', () => {
      // arrange
      const expectedSteps = [
        createMockStep('first'),
        createMockStep('second'),
        createMockStep('third'),
      ];
      const builder = new InstructionsBuilder(OperatingSystem.Android);
      const steps: readonly InstructionStepBuilderType[] = expectedSteps.map((step) => () => step);
      for (const step of steps) {
        builder.withStep(step);
      }
      // act
      const data = builder.build(createMockData());
      // assert
      const actualSteps = data.steps;
      expect(actualSteps).to.have.members(expectedSteps);
    });
    it('builds with expected OS', () => {
      // arrange
      const expected = OperatingSystem.Linux;
      const sut = new InstructionsBuilder(expected);
      // act
      const actual = sut.build(createMockData()).operatingSystem;
      // assert
      expect(true);
      expect(actual).to.equal(expected);
    });
    describe('throws when data is missing', () => {
      itEachAbsentObjectValue((absentValue) => {
        // arrange
        const expectedError = 'missing data';
        const data = absentValue;
        const sut = new InstructionsBuilder(OperatingSystem.Linux);
        // act
        const act = () => sut.build(data);
        // assert
        expect(act).to.throw(expectedError);
      });
    });
  });
});

function createMockData(): IInstructionsBuilderData {
  return {
    fileName: 'instructions-file',
  };
}

function createMockStep(identifier = 'mock step'): IInstructionListStep {
  return {
    action: createMockInfo(`${identifier} | action`),
    code: createMockInfo(`${identifier} | code`),
  };
}

function createMockInfo(identifier = 'mock info'): IInstructionInfo {
  return {
    instruction: `${identifier} | mock instruction`,
    details: `${identifier} | mock details`,
  };
}
