import { OperatingSystem } from '@/domain/OperatingSystem';
import { IBrowserOsDetector } from '@/infrastructure/RuntimeEnvironment/BrowserOs/IBrowserOsDetector';

export class BrowserOsDetectorStub implements IBrowserOsDetector {
  public detect(): OperatingSystem {
    return OperatingSystem.BlackBerryTabletOS;
  }
}
