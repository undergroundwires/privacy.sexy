import { IApplication } from '@/domain/IApplication';
import { IApplicationState } from './IApplicationState';

export interface IApplicationContext {
    readonly app: IApplication;
    readonly state: IApplicationState;
}
