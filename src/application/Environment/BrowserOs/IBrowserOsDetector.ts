import { OperatingSystem } from '@/domain/OperatingSystem';

export interface IBrowserOsDetector {
  detect(userAgent: string): OperatingSystem | undefined;
}
