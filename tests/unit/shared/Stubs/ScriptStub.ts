import type { Script } from '@/domain/Executables/Script/Script';
import { RecommendationLevel } from '@/domain/Executables/Script/RecommendationLevel';
import type { ExecutableId, ExecutableKey } from '@/domain/Executables/ExecutableKey/ExecutableKey';
import type { ScriptCode } from '@/domain/Executables/Script/Code/ScriptCode';
import { SelectedScriptStub } from './SelectedScriptStub';
import { ExecutableKeyStub } from './ExecutableKeyStub';
import { ScriptCodeStub } from './ScriptCodeStub';

export class ScriptStub implements Script {
  public readonly key: ExecutableKey;

  public name: string;

  public code: ScriptCode;

  public docs: readonly string[] = new Array<string>();

  public level? = RecommendationLevel.Standard;

  private isReversible: boolean | undefined = undefined;

  constructor(executableId: ExecutableId) {
    this.key = new ExecutableKeyStub()
      .withExecutableId(executableId);
    this.name = `[${ScriptStub.name}] name (${this.key.createSerializedKey()})`;
    this.code = new ScriptCodeStub()
      .withExecute(`${ScriptStub.name} execute-code (${this.key})`)
      .withRevert(`${ScriptStub.name} revert-code (${this.key})`);
  }

  public canRevert(): boolean {
    if (this.isReversible === undefined) {
      return Boolean(this.code.revert);
    }
    return this.isReversible;
  }

  public withLevel(value: RecommendationLevel | undefined): this {
    this.level = value;
    return this;
  }

  public withCode(value: string): this {
    this.code = new ScriptCodeStub()
      .withExecute(value)
      .withRevert(this.code.revert);
    return this;
  }

  public withName(name: string): this {
    this.name = name;
    return this;
  }

  public withReversibility(isReversible: boolean): this {
    this.isReversible = isReversible;
    return this;
  }

  public withRevertCode(revertCode?: string): this {
    this.code = {
      execute: this.code.execute,
      revert: revertCode,
    };
    return this;
  }

  public withDocs(docs: readonly string[]): this {
    this.docs = docs;
    return this;
  }

  public toSelectedScript(): SelectedScriptStub {
    return new SelectedScriptStub(this);
  }
}
