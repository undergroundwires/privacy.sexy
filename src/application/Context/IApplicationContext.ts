import { IApplication } from '@/domain/IApplication';
import { IApplicationState } from './State/IApplicationState';

export interface IApplicationContext {
    readonly app: IApplication;
    readonly state: IApplicationState;
}
