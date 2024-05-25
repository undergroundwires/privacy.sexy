import type { ScriptParser } from '@/application/Parser/Script/ScriptParser';
import type { IScript } from '@/domain/IScript';
import type { ScriptData } from '@/application/collections/';
import { ScriptStub } from './ScriptStub';

export class ScriptParserStub {
  private readonly parsedScripts = new Map<IScript, Parameters<ScriptParser>>();

  private readonly setupScripts = new Map<ScriptData, IScript>();

  public get(): ScriptParser {
    return (...parameters) => {
      const [scriptData] = parameters;
      const script = this.setupScripts.get(scriptData)
        ?? new ScriptStub(
          `[${ScriptParserStub.name}] parsed script stub number ${this.parsedScripts.size + 1}`,
        );
      this.parsedScripts.set(script, parameters);
      return script;
    };
  }

  public getParseParameters(
    script: IScript,
  ): Parameters<ScriptParser> {
    const parameters = this.parsedScripts.get(script);
    if (!parameters) {
      throw new Error('Script has never been parsed.');
    }
    return parameters;
  }

  public setupParsedResultForData(scriptData: ScriptData, parsedResult: IScript): this {
    this.setupScripts.set(scriptData, parsedResult);
    return this;
  }
}
