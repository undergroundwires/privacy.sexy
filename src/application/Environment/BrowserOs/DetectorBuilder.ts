import { IBrowserOsDetector } from './IBrowserOsDetector';
import { OperatingSystem } from '../OperatingSystem';

export class DetectorBuilder {
    private readonly existingPartsInUserAgent = new Array<string>();
    private readonly notExistingPartsInUserAgent = new Array<string>();

    constructor(private readonly os: OperatingSystem) { }

    public mustInclude(str: string): DetectorBuilder {
        if (!str) {
            throw new Error('part to include is empty or undefined');
        }
        this.existingPartsInUserAgent.push(str);
        return this;
    }

    public mustNotInclude(str: string): DetectorBuilder {
        if (!str) {
            throw new Error('part to not include is empty or undefined');
        }
        this.notExistingPartsInUserAgent.push(str);
        return this;
    }

    public build(): IBrowserOsDetector {
        if (!this.existingPartsInUserAgent.length) {
            throw new Error('Must include at least a part');
        }
        return {
            detect: (userAgent) => {
                if (!userAgent) {
                    throw new Error('User agent is null or undefined');
                }
                for (const exitingPart of this.existingPartsInUserAgent) {
                    if (!userAgent.includes(exitingPart)) {
                        return OperatingSystem.Unknown;
                    }
                }
                for (const notExistingPart of this.notExistingPartsInUserAgent) {
                    if (userAgent.includes(notExistingPart)) {
                        return OperatingSystem.Unknown;
                    }
                }
                return this.os;
            },
        };
    }
}
