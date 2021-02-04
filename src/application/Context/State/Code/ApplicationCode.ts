import { CodeChangedEvent } from './Event/CodeChangedEvent';
import { CodePosition } from './Position/CodePosition';
import { ICodeChangedEvent } from './Event/ICodeChangedEvent';
import { SelectedScript } from '@/application/Context/State/Selection/SelectedScript';
import { IUserSelection } from '@/application/Context/State/Selection/IUserSelection';
import { UserScriptGenerator } from './Generation/UserScriptGenerator';
import { EventSource } from '@/infrastructure/Events/EventSource';
import { IApplicationCode } from './IApplicationCode';
import { IUserScriptGenerator } from './Generation/IUserScriptGenerator';
import { IScriptingDefinition } from '@/domain/IScriptingDefinition';

export class ApplicationCode implements IApplicationCode {
    public readonly changed = new EventSource<ICodeChangedEvent>();
    public current: string;

    private scriptPositions = new Map<SelectedScript, CodePosition>();

    constructor(
        userSelection: IUserSelection,
        private readonly scriptingDefinition: IScriptingDefinition,
        private readonly generator: IUserScriptGenerator = new UserScriptGenerator()) {
        if (!userSelection) { throw new Error('userSelection is null or undefined'); }
        if (!scriptingDefinition) { throw new Error('scriptingDefinition is null or undefined'); }
        if (!generator) { throw new Error('generator is null or undefined'); }
        this.setCode(userSelection.selectedScripts);
        userSelection.changed.on((scripts) => {
            this.setCode(scripts);
        });
    }

    private setCode(scripts: ReadonlyArray<SelectedScript>): void {
        const oldScripts = Array.from(this.scriptPositions.keys());
        const code = this.generator.buildCode(scripts, this.scriptingDefinition);
        this.current = code.code;
        this.scriptPositions = code.scriptPositions;
        const event = new CodeChangedEvent(code.code, oldScripts, code.scriptPositions);
        this.changed.notify(event);
    }
}
