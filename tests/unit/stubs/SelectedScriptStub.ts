import { SelectedScript } from '@/application/State/Selection/SelectedScript';
import { ScriptStub } from './ScriptStub';

export class SelectedScriptStub extends SelectedScript {
    constructor(id: string, revert = false) {
        super(new ScriptStub(id), revert);
    }
}
