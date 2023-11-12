import { OperatingSystem } from '@/domain/OperatingSystem';
import { IBrowserOsDetector } from './IBrowserOsDetector';

export class DetectorBuilder {
  private readonly existingPartsInUserAgent = new Array<string>();

  private readonly notExistingPartsInUserAgent = new Array<string>();

  constructor(private readonly os: OperatingSystem) { }

  public mustInclude(str: string): DetectorBuilder {
    return this.add(str, this.existingPartsInUserAgent);
  }

  public mustNotInclude(str: string): DetectorBuilder {
    return this.add(str, this.notExistingPartsInUserAgent);
  }

  public build(): IBrowserOsDetector {
    if (!this.existingPartsInUserAgent.length) {
      throw new Error('Must include at least a part');
    }
    return {
      detect: (agent) => this.detect(agent),
    };
  }

  private detect(userAgent: string): OperatingSystem | undefined {
    if (!userAgent) {
      return undefined;
    }
    if (this.existingPartsInUserAgent.some((part) => !userAgent.includes(part))) {
      return undefined;
    }
    if (this.notExistingPartsInUserAgent.some((part) => userAgent.includes(part))) {
      return undefined;
    }
    return this.os;
  }

  private add(part: string, array: string[]): DetectorBuilder {
    if (!part) {
      throw new Error('part is empty or undefined');
    }
    if (this.existingPartsInUserAgent.includes(part)) {
      throw new Error(`part ${part} is already included as existing part`);
    }
    if (this.notExistingPartsInUserAgent.includes(part)) {
      throw new Error(`part ${part} is already included as not existing part`);
    }
    array.push(part);
    return this;
  }
}
