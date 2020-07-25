import { OperatingSystem } from '@/application/Environment/OperatingSystem';

interface IDesktopTestCase {
    processPlatform: string;
    expectedOs: OperatingSystem;
}

// https://nodejs.org/api/process.html#process_process_platform
export const DesktopOsTestCases: ReadonlyArray<IDesktopTestCase> = [
    {
        processPlatform: 'aix',
        expectedOs: OperatingSystem.Unknown,
    },
    {
        processPlatform: 'darwin',
        expectedOs: OperatingSystem.macOS,
    },
    {
        processPlatform: 'freebsd',
        expectedOs: OperatingSystem.Unknown,
    },
    {
        processPlatform: 'linux',
        expectedOs: OperatingSystem.Linux,
    },
    {
        processPlatform: 'openbsd',
        expectedOs: OperatingSystem.Unknown,
    },
    {
        processPlatform: 'sunos',
        expectedOs: OperatingSystem.Unknown,
    },
    {
        processPlatform: 'win32',
        expectedOs: OperatingSystem.Windows,
    },
];
