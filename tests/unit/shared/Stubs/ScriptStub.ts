import { BaseEntity } from '@/infrastructure/Entity/BaseEntity';
import type { Script } from '@/domain/Executables/Script/Script';
import { RecommendationLevel } from '@/domain/Executables/Script/RecommendationLevel';
import type { ScriptCode } from '@/domain/Executables/Script/Code/ScriptCode';
import { SelectedScriptStub } from './SelectedScriptStub';

export class ScriptStub extends BaseEntity<string> implements Script {
  public name = `name${this.id}`;

  public code: ScriptCode = {
    execute: `REM execute-code (${this.id})`,
    revert: `REM revert-code (${this.id})`,
  };

  public docs: readonly string[] = new Array<string>();

  public level? = RecommendationLevel.Standard;

  private isReversible: boolean | undefined = undefined;

  constructor(public readonly id: string) {
    super(id);
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
    this.code = {
      execute: value,
      revert: this.code.revert,
    };
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
