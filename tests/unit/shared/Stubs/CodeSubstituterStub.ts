import type { ProjectDetails } from '@/domain/Project/ProjectDetails';
import { ICodeSubstituter } from '@/application/Parser/ScriptingDefinition/ICodeSubstituter';

export class CodeSubstituterStub implements ICodeSubstituter {
  private readonly scenarios = new Array<{
    code: string, projectDetails: ProjectDetails, result: string }>();

  public substitute(code: string, projectDetails: ProjectDetails): string {
    const scenario = this.scenarios.find(
      (s) => s.code === code && s.projectDetails === projectDetails,
    );
    if (scenario) {
      return scenario.result;
    }
    return `[CodeSubstituterStub] - code: ${code}`;
  }

  public setup(code: string, projectDetails: ProjectDetails, result: string) {
    this.scenarios.push({ code, projectDetails, result });
    return this;
  }
}
