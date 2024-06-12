import type { ICodeChangedEvent } from '@/application/Context/State/Code/Event/ICodeChangedEvent';
import type { ICodePosition } from '@/application/Context/State/Code/Position/ICodePosition';
import type { Script } from '@/domain/Executables/Script/Script';

export class CodeChangedEventStub implements ICodeChangedEvent {
  public code: string;

  public addedScripts: readonly Script[];

  public removedScripts: readonly Script[];

  public changedScripts: readonly Script[];

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
