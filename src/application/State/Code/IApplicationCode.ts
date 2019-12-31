import { ISignal } from '@/infrastructure/Events/ISignal';

export interface IApplicationCode {
    readonly changed: ISignal<string>;
    readonly current: string;
}
