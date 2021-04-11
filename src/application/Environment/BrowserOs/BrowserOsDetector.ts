import { OperatingSystem } from '@/domain/OperatingSystem';
import { DetectorBuilder } from './DetectorBuilder';
import { IBrowserOsDetector } from './IBrowserOsDetector';

export class BrowserOsDetector implements IBrowserOsDetector {
    private readonly detectors = BrowserDetectors;
    public detect(userAgent: string): OperatingSystem | undefined {
        if (!userAgent) {
            return undefined;
        }
        for (const detector of this.detectors) {
            const os = detector.detect(userAgent);
            if (os !== undefined) {
                return os;
            }
        }
        return undefined;
    }
}

// Reference: https://github.com/keithws/browser-report/blob/master/index.js#L304
const BrowserDetectors =
[
    define(OperatingSystem.KaiOS, (b) =>
        b.mustInclude('KAIOS')),
    define(OperatingSystem.ChromeOS, (b) =>
        b.mustInclude('CrOS')),
    define(OperatingSystem.BlackBerryOS, (b) =>
        b.mustInclude('BlackBerry')),
    define(OperatingSystem.BlackBerryTabletOS, (b) =>
        b.mustInclude('RIM Tablet OS')),
    define(OperatingSystem.BlackBerry, (b) =>
        b.mustInclude('BB10')),
    define(OperatingSystem.Android, (b) =>
        b.mustInclude('Android').mustNotInclude('Windows Phone')),
    define(OperatingSystem.Android, (b) =>
        b.mustInclude('Adr').mustNotInclude('Windows Phone')),
    define(OperatingSystem.iOS, (b) =>
        b.mustInclude('like Mac OS X')),
    define(OperatingSystem.Linux, (b) =>
        b.mustInclude('Linux').mustNotInclude('Android').mustNotInclude('Adr')),
    define(OperatingSystem.Windows, (b) =>
        b.mustInclude('Windows').mustNotInclude('Windows Phone')),
    define(OperatingSystem.WindowsPhone, (b) =>
        b.mustInclude('Windows Phone')),
    define(OperatingSystem.macOS, (b) =>
        b.mustInclude('OS X').mustNotInclude('Android').mustNotInclude('like Mac OS X')),
];

function define(os: OperatingSystem, applyRules: (builder: DetectorBuilder) => DetectorBuilder): IBrowserOsDetector {
    const builder = new DetectorBuilder(os);
    applyRules(builder);
    return builder.build();
}
