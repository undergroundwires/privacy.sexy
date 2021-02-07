import { IApplication } from '@/domain/IApplication';

export interface IApplicationFactory {
    getAppAsync(): Promise<IApplication>;
}
