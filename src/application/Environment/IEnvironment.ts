import { OperatingSystem } from './OperatingSystem';

export interface IEnvironment {
    isDesktop: boolean;
    os: OperatingSystem;
}
