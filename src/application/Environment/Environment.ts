import { BrowserOsDetector } from './BrowserOs/BrowserOsDetector';
import { IBrowserOsDetector } from './BrowserOs/IBrowserOsDetector';
import { IEnvironment } from './IEnvironment';
import { OperatingSystem } from '@/domain/OperatingSystem';

interface IEnvironmentVariables {
    readonly window: Window & typeof globalThis;
    readonly process: NodeJS.Process;
    readonly navigator: Navigator;
}

export class Environment implements IEnvironment {
    public static readonly CurrentEnvironment: IEnvironment = new Environment({
        window,
        process: typeof process !== 'undefined' ? process /* electron only */ : undefined,
        navigator,
    });
    public readonly isDesktop: boolean;
    public readonly os: OperatingSystem;
    protected constructor(
      variables: IEnvironmentVariables,
      browserOsDetector: IBrowserOsDetector = new BrowserOsDetector()) {
        if (!variables) {
            throw new Error('variables is null or empty');
        }
        this.isDesktop = isDesktop(variables);
        if (this.isDesktop) {
            this.os = getDesktopOsType(getProcessPlatform(variables));
        } else {
            const userAgent = getUserAgent(variables);
            this.os = !userAgent ? undefined : browserOsDetector.detect(userAgent);
        }
    }
}

function getUserAgent(variables: IEnvironmentVariables): string {
    if (!variables.window || !variables.window.navigator) {
        return undefined;
    }
    return variables.window.navigator.userAgent;
}

function getProcessPlatform(variables: IEnvironmentVariables): string {
    if (!variables.process || !variables.process.platform) {
        return undefined;
    }
    return variables.process.platform;
}

function getDesktopOsType(processPlatform: string): OperatingSystem | undefined {
    // https://nodejs.org/api/process.html#process_process_platform
    if (processPlatform === 'darwin') {
        return OperatingSystem.macOS;
    } else if (processPlatform === 'win32') {
        return OperatingSystem.Windows;
    } else if (processPlatform === 'linux') {
        return OperatingSystem.Linux;
    }
    return undefined;
}

function isDesktop(variables: IEnvironmentVariables): boolean {
    // More: https://github.com/electron/electron/issues/2288
    // Renderer process
    if (variables.window
        && variables.window.process
        && variables.window.process.type === 'renderer') {
        return true;
    }
    // Main process
    if (variables.process
        && variables.process.versions
        && Boolean(variables.process.versions.electron)) {
        return true;
    }
    // Detect the user agent when the `nodeIntegration` option is set to true
    if (variables.navigator
        && variables.navigator.userAgent
        && variables.navigator.userAgent.includes('Electron')) {
        return true;
    }
    return false;
}
