import { ScriptDiagnosticData, ScriptDiagnosticsCollector } from '@/application/ScriptDiagnostics/ScriptDiagnosticsCollector';
import { OperatingSystem } from '@/domain/OperatingSystem';

export class ScriptDiagnosticsCollectorStub implements ScriptDiagnosticsCollector {
  private operatingSystem: OperatingSystem | undefined = OperatingSystem.Windows;

  private scriptDirectoryPath: string | undefined = '/test/scripts/directory/path';

  public withOperatingSystem(operatingSystem: OperatingSystem | undefined): this {
    this.operatingSystem = operatingSystem;
    return this;
  }

  public withScriptDirectoryPath(scriptDirectoryPath: string | undefined): this {
    this.scriptDirectoryPath = scriptDirectoryPath;
    return this;
  }

  public collectDiagnosticInformation(): Promise<ScriptDiagnosticData> {
    return Promise.resolve({
      scriptsDirectoryAbsolutePath: this.scriptDirectoryPath,
      currentOperatingSystem: this.operatingSystem,
    });
  }
}
