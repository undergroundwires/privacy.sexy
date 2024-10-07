import type { ScriptDiagnosticData, ScriptDiagnosticsCollector } from '@/application/ScriptDiagnostics/ScriptDiagnosticsCollector';
import type { RuntimeEnvironment } from '@/infrastructure/RuntimeEnvironment/RuntimeEnvironment';
import { CurrentEnvironment } from '@/infrastructure/RuntimeEnvironment/RuntimeEnvironmentFactory';
import type { ApplicationDirectoryProvider } from '@/infrastructure/FileSystem/Directory/ApplicationDirectoryProvider';
import { PersistentApplicationDirectoryProvider } from '@/infrastructure/FileSystem/Directory/PersistentApplicationDirectoryProvider';

export class ScriptEnvironmentDiagnosticsCollector implements ScriptDiagnosticsCollector {
  constructor(
    private readonly directoryProvider: ApplicationDirectoryProvider
    = new PersistentApplicationDirectoryProvider(),
    private readonly environment: RuntimeEnvironment = CurrentEnvironment,
  ) { }

  public async collectDiagnosticInformation(): Promise<ScriptDiagnosticData> {
    const {
      directoryAbsolutePath: scriptsDirectory,
    } = await this.directoryProvider.provideDirectory('script-runs');
    return {
      scriptsDirectoryAbsolutePath: scriptsDirectory,
      currentOperatingSystem: this.environment.os,
    };
  }
}
