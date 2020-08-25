import { ICodeChangedEvent } from './Event/ICodeChangedEvent';
import { ISignal } from '@/infrastructure/Events/ISignal';

export interface IApplicationCode {
    readonly changed: ISignal<ICodeChangedEvent>;
    readonly current: string;
}
