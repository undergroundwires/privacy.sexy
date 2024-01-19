import { OperatingSystem } from '@/domain/OperatingSystem';

export interface BrowserEnvironment {
  readonly isTouchSupported: boolean;
  readonly userAgent: string;
}

export interface BrowserOsDetector {
  detect(environment: BrowserEnvironment): OperatingSystem | undefined;
}
