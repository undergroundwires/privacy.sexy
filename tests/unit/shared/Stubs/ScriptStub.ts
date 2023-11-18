import { BaseEntity } from '@/infrastructure/Entity/BaseEntity';
import { IScript } from '@/domain/IScript';
import { RecommendationLevel } from '@/domain/RecommendationLevel';
import { IScriptCode } from '@/domain/IScriptCode';
import { SelectedScriptStub } from './SelectedScriptStub';

export class ScriptStub extends BaseEntity<string> implements IScript {
  public name = `name${this.id}`;

  public code: IScriptCode = {
    execute: `REM execute-code (${this.id})`,
    revert: `REM revert-code (${this.id})`,
  };

  public readonly docs = new Array<string>();

  public level? = RecommendationLevel.Standard;

  constructor(public readonly id: string) {
    super(id);
  }

  public canRevert(): boolean {
    return Boolean(this.code.revert);
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

  public withRevertCode(revertCode?: string): this {
    this.code = {
      execute: this.code.execute,
      revert: revertCode,
    };
    return this;
  }

  public toSelectedScript(): SelectedScriptStub {
    return new SelectedScriptStub(this);
  }
}
