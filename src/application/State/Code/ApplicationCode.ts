import { UserScriptGenerator } from './UserScriptGenerator';
import { IUserSelection } from './../Selection/IUserSelection';
import { Signal } from '@/infrastructure/Events/Signal';
import { IApplicationCode } from './IApplicationCode';
import { IScript } from '@/domain/IScript';

export class ApplicationCode implements IApplicationCode {
    public readonly changed = new Signal<string>();
    public current: string;

    private readonly generator: UserScriptGenerator;

    constructor(userSelection: IUserSelection, private readonly version: string) {
        if (!userSelection) { throw new Error('userSelection is null or undefined'); }
        if (!version) { throw new Error('version is null or undefined'); }
        this.generator = new UserScriptGenerator();
        this.setCode(userSelection.selectedScripts);
        userSelection.changed.on((scripts) => {
            this.setCode(scripts);
        });
    }

    private setCode(scripts: ReadonlyArray<IScript>) {
        this.current = scripts.length === 0 ? '' : this.generator.buildCode(scripts, this.version);
        this.changed.notify(this.current);
    }
}
