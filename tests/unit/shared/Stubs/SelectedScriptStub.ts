import type { SelectedScript } from '@/application/Context/State/Selection/Script/SelectedScript';
import type { Script } from '@/domain/Executables/Script/Script';

export class SelectedScriptStub implements SelectedScript {
  public readonly script: Script;

  public readonly id: string;

  public revert: boolean;

  constructor(
    script: Script,
  ) {
    this.id = script.id;
    this.script = script;
  }

  public withRevert(revert: boolean): this {
    this.revert = revert;
    return this;
  }

  public equals(): boolean {
    throw new Error('Method not implemented.');
  }
}
