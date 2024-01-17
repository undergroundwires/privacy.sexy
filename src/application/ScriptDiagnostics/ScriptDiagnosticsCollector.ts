import { OperatingSystem } from '@/domain/OperatingSystem';

export interface ScriptDiagnosticsCollector {
  collectDiagnosticInformation(): Promise<ScriptDiagnosticData>;
}

export interface ScriptDiagnosticData {
  readonly scriptsDirectoryAbsolutePath?: string;
  readonly currentOperatingSystem?: OperatingSystem;
}
