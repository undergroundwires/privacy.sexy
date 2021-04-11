import { OperatingSystem } from '@/domain/OperatingSystem';

interface IDesktopTestCase {
    processPlatform: string;
    expectedOs: OperatingSystem;
}

// https://nodejs.org/api/process.html#process_process_platform
export const DesktopOsTestCases: ReadonlyArray<IDesktopTestCase> = [
    {
        processPlatform: 'aix',
        expectedOs: undefined,
    },
    {
        processPlatform: 'darwin',
        expectedOs: OperatingSystem.macOS,
    },
    {
        processPlatform: 'freebsd',
        expectedOs: undefined,
    },
    {
        processPlatform: 'linux',
        expectedOs: OperatingSystem.Linux,
    },
    {
        processPlatform: 'openbsd',
        expectedOs: undefined,
    },
    {
        processPlatform: 'sunos',
        expectedOs: undefined,
    },
    {
        processPlatform: 'win32',
        expectedOs: OperatingSystem.Windows,
    },
];
