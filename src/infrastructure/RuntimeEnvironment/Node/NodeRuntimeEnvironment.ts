import { OperatingSystem } from '@/domain/OperatingSystem';
import { RuntimeEnvironment } from '../RuntimeEnvironment';
import { convertPlatformToOs } from './NodeOsMapper';

export class NodeRuntimeEnvironment implements RuntimeEnvironment {
  public readonly isRunningAsDesktopApplication: boolean;

  public readonly os: OperatingSystem | undefined;

  public readonly isNonProduction: boolean;

  constructor(
    nodeProcess: NodeJSProcessAccessor = globalThis.process,
    convertToOs: PlatformToOperatingSystemConverter = convertPlatformToOs,
  ) {
    if (!nodeProcess) { throw new Error('missing process'); } // do not trust strictNullChecks for global objects
    this.isRunningAsDesktopApplication = true;
    this.os = convertToOs(nodeProcess.platform);
    this.isNonProduction = nodeProcess.env.NODE_ENV !== 'production'; // populated by Vite
  }
}

export interface NodeJSProcessAccessor {
  readonly platform: NodeJS.Platform;
  readonly env: NodeJS.ProcessEnv;
}

export type PlatformToOperatingSystemConverter = typeof convertPlatformToOs;
