import { CodeChangedEvent } from './Event/CodeChangedEvent';
import { CodePosition } from './Position/CodePosition';
import { ICodeChangedEvent } from './Event/ICodeChangedEvent';
import { SelectedScript } from '@/application/State/Selection/SelectedScript';
import { IUserSelection } from '@/application/State/Selection/IUserSelection';
import { UserScriptGenerator } from './Generation/UserScriptGenerator';
import { Signal } from '@/infrastructure/Events/Signal';
import { IApplicationCode } from './IApplicationCode';
import { IUserScriptGenerator } from './Generation/IUserScriptGenerator';

export class ApplicationCode implements IApplicationCode {
    public readonly changed = new Signal<ICodeChangedEvent>();
    public current: string;

    private scriptPositions = new Map<SelectedScript, CodePosition>();

    constructor(
        userSelection: IUserSelection,
        private readonly version: string,
        private readonly generator: IUserScriptGenerator = new UserScriptGenerator()) {
        if (!userSelection) { throw new Error('userSelection is null or undefined'); }
        if (!version) { throw new Error('version is null or undefined'); }
        if (!generator) { throw new Error('generator is null or undefined'); }
        this.setCode(userSelection.selectedScripts);
        userSelection.changed.on((scripts) => {
            this.setCode(scripts);
        });
    }

    private setCode(scripts: ReadonlyArray<SelectedScript>): void {
        const oldScripts = Array.from(this.scriptPositions.keys());
        const code = this.generator.buildCode(scripts, this.version);
        this.current = code.code;
        this.scriptPositions = code.scriptPositions;
        const event = new CodeChangedEvent(code.code, oldScripts, code.scriptPositions);
        this.changed.notify(event);
    }
}
