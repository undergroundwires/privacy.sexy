import { IProjectInformation } from '@/domain/IProjectInformation';
import { ICodeSubstituter } from '@/application/Parser/ScriptingDefinition/ICodeSubstituter';

export class CodeSubstituterStub implements ICodeSubstituter {
  private readonly scenarios =
  new Array<{ code: string, info: IProjectInformation, result: string }>();

  public substitute(code: string, info: IProjectInformation): string {
    const scenario = this.scenarios.find((s) => s.code === code && s.info === info);
    if (scenario) {
      return scenario.result;
    }
    return `[CodeSubstituterStub] - code: ${code}`;
  }

  public setup(code: string, info: IProjectInformation, result: string) {
    this.scenarios.push({ code, info, result });
    return this;
  }
}
