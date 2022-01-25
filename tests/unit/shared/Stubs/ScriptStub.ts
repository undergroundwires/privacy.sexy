import { BaseEntity } from '@/infrastructure/Entity/BaseEntity';
import { IScript } from '@/domain/IScript';
import { RecommendationLevel } from '@/domain/RecommendationLevel';
import { SelectedScript } from '@/application/Context/State/Selection/SelectedScript';

export class ScriptStub extends BaseEntity<string> implements IScript {
  public name = `name${this.id}`;

  public code = {
    execute: `REM execute-code (${this.id})`,
    revert: `REM revert-code (${this.id})`,
  };

  public readonly documentationUrls = new Array<string>();

  public level? = RecommendationLevel.Standard;

  constructor(public readonly id: string) {
    super(id);
  }

  public canRevert(): boolean {
    return Boolean(this.code.revert);
  }

  public withLevel(value?: RecommendationLevel): ScriptStub {
    this.level = value;
    return this;
  }

  public withCode(value: string): ScriptStub {
    this.code.execute = value;
    return this;
  }

  public withName(name: string): ScriptStub {
    this.name = name;
    return this;
  }

  public withRevertCode(revertCode: string): ScriptStub {
    this.code.revert = revertCode;
    return this;
  }

  public toSelectedScript(isReverted = false): SelectedScript {
    return new SelectedScript(this, isReverted);
  }
}
