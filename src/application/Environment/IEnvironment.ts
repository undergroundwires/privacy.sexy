import { OperatingSystem } from '@/domain/OperatingSystem';

export interface IEnvironment {
    readonly isDesktop: boolean;
    readonly os: OperatingSystem;
}
