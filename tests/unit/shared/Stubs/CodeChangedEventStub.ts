import type { ICodeChangedEvent } from '@/application/Context/State/Code/Event/ICodeChangedEvent';
import type { ICodePosition } from '@/application/Context/State/Code/Position/ICodePosition';
import type { Script } from '@/domain/Executables/Script/Script';
import { ScriptStub } from './ScriptStub';

export class CodeChangedEventStub implements ICodeChangedEvent {
  public code: string = `[${CodeChangedEventStub.name}]code`;

  public addedScripts: readonly Script[] = [
    new ScriptStub(`[${CodeChangedEventStub.name}]added-script`),
  ];

  public removedScripts: readonly Script[] = [
    new ScriptStub(`[${CodeChangedEventStub.name}]removed-script`),
  ];

  public changedScripts: readonly Script[] = [
    new ScriptStub(`[${CodeChangedEventStub.name}]changed-script`),
  ];

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
