import { IScript } from '@/domain/IScript';
import { ICodePosition } from '@/application/Context/State/Code/Position/ICodePosition';

export interface ICodeChangedEvent {
    readonly code: string;
    addedScripts: ReadonlyArray<IScript>;
    removedScripts: ReadonlyArray<IScript>;
    changedScripts: ReadonlyArray<IScript>;
    isEmpty(): boolean;
    getScriptPositionInCode(script: IScript): ICodePosition;
}
