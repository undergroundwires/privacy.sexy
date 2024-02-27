import type { ICodeChangedEvent } from '@/application/Context/State/Code/Event/ICodeChangedEvent';
import type { ICodePosition } from '@/application/Context/State/Code/Position/ICodePosition';
import type { IScript } from '@/domain/IScript';

export class CodeChangedEventStub implements ICodeChangedEvent {
  public code: string;

  public addedScripts: readonly IScript[];

  public removedScripts: readonly IScript[];

  public changedScripts: readonly IScript[];

  public isEmpty(): boolean {
    throw new Error('Method not implemented.');
  }

  public getScriptPositionInCode(): ICodePosition {
    throw new Error('Method not implemented.');
  }

  public withCode(code: string): this {
    this.code = code;
    return this;
  }
}
