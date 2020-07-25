import { OperatingSystem } from '../OperatingSystem';

export interface IBrowserOsDetector {
    detect(userAgent: string): OperatingSystem;
}
