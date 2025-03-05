import type { ScriptParser } from '@/application/Application/Loader/Collections/Compiler/Executable/Script/ScriptParser';
import type { Script } from '@/domain/Executables/Script/Script';
import type { ScriptData } from '@/application/collections/';
import { ScriptStub } from './ScriptStub';

export class ScriptParserStub {
  private readonly parsedScripts = new Map<Script, Parameters<ScriptParser>>();

  private readonly setupScripts = new Map<ScriptData, Script>();

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
    script: Script,
  ): Parameters<ScriptParser> {
    const parameters = this.parsedScripts.get(script);
    if (!parameters) {
      throw new Error('Script has never been parsed.');
    }
    return parameters;
  }

  public setupParsedResultForData(scriptData: ScriptData, parsedResult: Script): this {
    this.setupScripts.set(scriptData, parsedResult);
    return this;
  }
}
