import type { ScriptDiagnosticData, ScriptDiagnosticsCollector } from '@/application/ScriptDiagnostics/ScriptDiagnosticsCollector';
import type { RuntimeEnvironment } from '@/infrastructure/RuntimeEnvironment/RuntimeEnvironment';
import { CurrentEnvironment } from '@/infrastructure/RuntimeEnvironment/RuntimeEnvironmentFactory';
import { PersistentDirectoryProvider } from '@/infrastructure/CodeRunner/Creation/Directory/PersistentDirectoryProvider';
import type { ScriptDirectoryProvider } from '../CodeRunner/Creation/Directory/ScriptDirectoryProvider';

export class ScriptEnvironmentDiagnosticsCollector implements ScriptDiagnosticsCollector {
  constructor(
    private readonly directoryProvider: ScriptDirectoryProvider = new PersistentDirectoryProvider(),
    private readonly environment: RuntimeEnvironment = CurrentEnvironment,
  ) { }

  public async collectDiagnosticInformation(): Promise<ScriptDiagnosticData> {
    const { directoryAbsolutePath } = await this.directoryProvider.provideScriptDirectory();
    return {
      scriptsDirectoryAbsolutePath: directoryAbsolutePath,
      currentOperatingSystem: this.environment.os,
    };
  }
}
