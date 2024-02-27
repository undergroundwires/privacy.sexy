import { OperatingSystem } from '@/domain/OperatingSystem';
import type { BrowserEnvironment, BrowserOsDetector } from '@/infrastructure/RuntimeEnvironment/Browser/BrowserOs/BrowserOsDetector';
import { StubWithObservableMethodCalls } from './StubWithObservableMethodCalls';

export class BrowserOsDetectorStub
  extends StubWithObservableMethodCalls<BrowserOsDetector>
  implements BrowserOsDetector {
  public detect(environment: BrowserEnvironment): OperatingSystem {
    this.registerMethodCall({
      methodName: 'detect',
      args: [environment],
    });
    return OperatingSystem.BlackBerryTabletOS;
  }
}
