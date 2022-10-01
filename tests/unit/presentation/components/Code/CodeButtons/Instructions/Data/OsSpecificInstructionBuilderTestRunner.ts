import { expect } from 'chai';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { InstructionsBuilder } from '@/presentation/components/Code/CodeButtons/Instructions/Data/InstructionsBuilder';

interface ITestData {
  readonly factory: () => InstructionsBuilder;
  readonly os: OperatingSystem;
}

export function runOsSpecificInstructionBuilderTests(data: ITestData) {
  it('builds multiple steps', () => {
    // arrange
    const sut = data.factory();
    // act
    const result = sut.build({ fileName: 'test.file' });
    // assert
    expect(result.steps).to.have.length.greaterThan(0);
  });
  it(`operatingSystem return ${OperatingSystem[data.os]}`, () => {
    // arrange
    const expected = data.os;
    const sut = data.factory();
    // act
    const result = sut.build({ fileName: 'test.file' });
    // assert
    expect(result.operatingSystem).to.equal(expected);
  });
}
