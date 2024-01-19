import { OperatingSystem } from '@/domain/OperatingSystem';
import { Logger } from '@/application/Common/Log/Logger';
import { CodeRunner } from '@/application/CodeRunner/CodeRunner';
import { Dialog } from '@/presentation/common/Dialog';
import { ScriptDiagnosticsCollector } from '@/application/ScriptDiagnostics/ScriptDiagnosticsCollector';

/* Primary entry point for platform-specific injections */
export interface WindowVariables {
  readonly isRunningAsDesktopApplication?: true;
  readonly codeRunner?: CodeRunner;
  readonly os?: OperatingSystem;
  readonly log?: Logger;
  readonly dialog?: Dialog;
  readonly scriptDiagnosticsCollector?: ScriptDiagnosticsCollector;
}
