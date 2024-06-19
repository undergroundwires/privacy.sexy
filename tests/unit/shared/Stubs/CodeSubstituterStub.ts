import type { ProjectDetails } from '@/domain/Project/ProjectDetails';
import type { CodeSubstituter } from '@/application/Parser/ScriptingDefinition/CodeSubstituter';

export class CodeSubstituterStub {
  private readonly scenarios = new Array<{
    code: string, projectDetails: ProjectDetails, result: string }>();

  public setup(code: string, projectDetails: ProjectDetails, result: string) {
    this.scenarios.push({ code, projectDetails, result });
    return this;
  }

  public substitute: CodeSubstituter = (code: string, projectDetails: ProjectDetails) => {
    const scenario = this.scenarios.find(
      (s) => s.code === code && s.projectDetails === projectDetails,
    );
    if (scenario) {
      return scenario.result;
    }
    return `[${CodeSubstituterStub.name}] - code: ${code}`;
  };
}
