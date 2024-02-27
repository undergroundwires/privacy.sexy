import { describe, it, expect } from 'vitest';
import { CodeSubstituter } from '@/application/Parser/ScriptingDefinition/CodeSubstituter';
import type { IExpressionsCompiler } from '@/application/Parser/Script/Compiler/Expressions/IExpressionsCompiler';
import { ProjectDetailsStub } from '@tests/unit/shared/Stubs/ProjectDetailsStub';
import { ExpressionsCompilerStub } from '@tests/unit/shared/Stubs/ExpressionsCompilerStub';
import { itEachAbsentStringValue } from '@tests/unit/shared/TestCases/AbsentTests';

describe('CodeSubstituter', () => {
  describe('throws if code is empty', () => {
    itEachAbsentStringValue((emptyCode) => {
      // arrange
      const expectedError = 'missing code';
      const code = emptyCode;
      const projectDetails = new ProjectDetailsStub();
      const sut = new CodeSubstituterBuilder().build();
      // act
      const act = () => sut.substitute(code, projectDetails);
      // assert
      expect(act).to.throw(expectedError);
    }, { excludeNull: true, excludeUndefined: true });
  });
  describe('substitutes parameters as expected values', () => {
    // arrange
    const projectDetails = new ProjectDetailsStub();
    const date = new Date();
    const testCases: Array<{ parameter: string, argument: string }> = [
      {
        parameter: 'homepage',
        argument: projectDetails.homepage,
      },
      {
        parameter: 'version',
        argument: projectDetails.version.toString(),
      },
      {
        parameter: 'date',
        argument: date.toUTCString(),
      },
    ];
    for (const testCase of testCases) {
      it(`substitutes ${testCase.parameter} as expected`, () => {
        const compilerStub = new ExpressionsCompilerStub();
        const sut = new CodeSubstituterBuilder()
          .withCompiler(compilerStub)
          .withDate(date)
          .build();
        // act
        sut.substitute('non empty code', projectDetails);
        // assert
        expect(compilerStub.callHistory).to.have.lengthOf(1);
        const parameters = compilerStub.callHistory[0].args[1];
        expect(parameters.hasArgument(testCase.parameter));
        const { argumentValue } = parameters.getArgument(testCase.parameter);
        expect(argumentValue).to.equal(testCase.argument);
      });
    }
  });
  it('returns code as it is', () => {
    // arrange
    const expected = 'expected-code';
    const compilerStub = new ExpressionsCompilerStub();
    const sut = new CodeSubstituterBuilder()
      .withCompiler(compilerStub)
      .build();
    // act
    sut.substitute(expected, new ProjectDetailsStub());
    // assert
    expect(compilerStub.callHistory).to.have.lengthOf(1);
    expect(compilerStub.callHistory[0].args[0]).to.equal(expected);
  });
});

class CodeSubstituterBuilder {
  private compiler: IExpressionsCompiler = new ExpressionsCompilerStub();

  private date = new Date();

  public withCompiler(compiler: IExpressionsCompiler) {
    this.compiler = compiler;
    return this;
  }

  public withDate(date: Date) {
    this.date = date;
    return this;
  }

  public build() {
    return new CodeSubstituter(this.compiler, this.date);
  }
}
