import { OperatingSystem } from '@/domain/OperatingSystem';

export interface IEnvironment {
    isDesktop: boolean;
    os: OperatingSystem;
}
