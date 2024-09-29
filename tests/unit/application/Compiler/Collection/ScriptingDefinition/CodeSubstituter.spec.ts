import { describe, it, expect } from 'vitest';
import type { IExpressionsCompiler } from '@/application/Parser/Executable/Script/Compiler/Expressions/IExpressionsCompiler';
import { ProjectDetailsStub } from '@tests/unit/shared/Stubs/ProjectDetailsStub';
import { ExpressionsCompilerStub } from '@tests/unit/shared/Stubs/ExpressionsCompilerStub';
import { itEachAbsentStringValue } from '@tests/unit/shared/TestCases/AbsentTests';
import { substituteCode } from '@/application/Compiler/Collection/ScriptingDefinition/CodeSubstituter';
import type { ProjectDetails } from '@/domain/Project/ProjectDetails';
import type { FunctionCallArgumentFactory } from '@/application/Parser/Executable/Script/Compiler/Function/Call/Argument/FunctionCallArgument';
import { FunctionCallArgumentFactoryStub } from '@tests/unit/shared/Stubs/FunctionCallArgumentFactoryStub';

describe('CodeSubstituter', () => {
  describe('substituteCode', () => {
    describe('throws if code is empty', () => {
      itEachAbsentStringValue((emptyCode) => {
        // arrange
        const expectedError = 'missing code';
        const context = new TestContext()
          .withCode(emptyCode);
        // act
        const act = () => context.substitute();
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
          const context = new TestContext()
            .withCompiler(compilerStub)
            .withDate(date)
            .withProjectDetails(projectDetails);
          // act
          context.substitute();
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
      const context = new TestContext()
        .withCompiler(compilerStub)
        .withCode(expected);
      // act
      context.substitute();
      // assert
      expect(compilerStub.callHistory).to.have.lengthOf(1);
      expect(compilerStub.callHistory[0].args[0]).to.equal(expected);
    });
  });
});

class TestContext {
  private compiler: IExpressionsCompiler = new ExpressionsCompilerStub();

  private date = new Date();

  private code = `[${TestContext.name}] default code for testing`;

  private projectDetails: ProjectDetails = new ProjectDetailsStub();

  private callArgumentFactory
  : FunctionCallArgumentFactory = new FunctionCallArgumentFactoryStub().factory;

  public withCompiler(compiler: IExpressionsCompiler): this {
    this.compiler = compiler;
    return this;
  }

  public withDate(date: Date): this {
    this.date = date;
    return this;
  }

  public withCode(code: string): this {
    this.code = code;
    return this;
  }

  public withProjectDetails(projectDetails: ProjectDetails): this {
    this.projectDetails = projectDetails;
    return this;
  }

  public substitute(): ReturnType<typeof substituteCode> {
    return substituteCode(
      this.code,
      this.projectDetails,
      {
        compiler: this.compiler,
        provideDate: () => this.date,
        createCallArgument: this.callArgumentFactory,
      },
    );
  }
}
