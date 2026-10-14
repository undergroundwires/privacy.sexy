import {
  beforeAll, describe, expect, it,
} from 'vitest';
import MacOsCollection from '@/application/collections/macos.yaml';
import { loadApplicationComposite } from '@/application/Application/Loader/CompositeApplicationLoader';
import { createScriptCompiler } from '@/application/Application/Loader/Collections/Compiler/Executable/Script/Compiler/ScriptCompilerFactory';
import { UserScriptGenerator } from '@/application/Context/State/Code/Generation/UserScriptGenerator';
import { UserSelectedScript } from '@/application/Context/State/Selection/Script/UserSelectedScript';
import type { Application } from '@/domain/Application/Application';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { ScriptLanguage } from '@/domain/ScriptMetadata/ScriptLanguage';
import { BASE_APP_COMPILATION_TIMEOUT_MS } from '@tests/shared/TestTiming';

describe('macOS quiet output generation', () => {
  let application: Application;

  beforeAll(() => {
    application = loadApplicationComposite();
  }, BASE_APP_COMPILATION_TIMEOUT_MS);

  it('removes verbose file deletion output without changing direct cleanup targets', () => {
    // Given
    const collection = application.getCollection(OperatingSystem.macOS);
    const scripts = collection.getAllScripts();

    // When
    const generatedCode = new UserScriptGenerator().buildCode(
      scripts.map((script) => new UserSelectedScript(script, false)),
      collection.scriptMetadata,
    ).code;

    // Then
    expect(generatedCode).not.toMatch(/\brm\s+-[^\s]*v/);
    expect(generatedCode).not.toMatch(/\brm\b[^\n]*&>\s*\/?dev\/null/);
    expect(generatedCode).toContain('sudo rm -rf /var/spool/cups/c0*');
    expect(generatedCode).toContain('sudo rm -rf /var/spool/cups/tmp/*');
    expect(generatedCode).toContain('sudo rm -rf /var/spool/cups/cache/job.cache*');
  });

  it.each([false, true])('keeps DeleteGlob recursion, glob handling, and elevation when elevated is %s', (elevated) => {
    // Given
    const compiler = createScriptCompiler({
      categoryContext: {
        functions: MacOsCollection.functions ?? [],
        language: ScriptLanguage.shellscript,
      },
    });

    // When
    const generatedCode = compiler.compile({
      name: 'Directory with spaces',
      call: {
        function: 'ClearDirectoryContents',
        parameters: {
          directoryGlob: '$HOME/Library/Application Support/privacy.sexy/runs',
          ...(elevated ? { grantPermissions: 'true' } : {}),
        },
      },
    }).execute;

    // Then
    expect(generatedCode).toMatch(/\(\s*IFS=\s*\n/);
    expect(generatedCode).toContain(`${elevated ? 'sudo ' : ''}rm -rf -- $glob_pattern`);
    expect(generatedCode.trim()).toMatch(/\)$/);
  });

  it('suppresses routine progress while retaining prerequisite and failure diagnostics', () => {
    // Given
    const collection = application.getCollection(OperatingSystem.macOS);

    // When
    const yarnCode = collection.getScript('Clear Yarn cache').code.execute;
    const googleUpdateCode = collection.getScript('Remove Google Software Update service').code.execute;
    const permissionsCode = collection.getScript('Clear "Camera" permissions').code.execute;

    // Then
    expect(yarnCode).not.toContain('Cleanup Yarn Cache');
    expect(googleUpdateCode).not.toContain('Uninstalled Google update');
    expect(googleUpdateCode).toContain('Google update file does not exist');
    expect(permissionsCode).toContain('reset_output=$(tccutil reset "$serviceId" 2>&1)');
    expect(permissionsCode).not.toContain('Successfully reset permissions');
    expect(permissionsCode).toContain('is not supported on your operating system version');
    expect(permissionsCode).toContain('Failed to reset permissions');
  });

  it.each([
    ['Clear Composer cache', 'composer clearcache', 'output_file', 'command_status'],
    ['Clear Homebrew cache', 'brew cleanup -s', 'brew_cleanup_output_file', 'brew_cleanup_status'],
    ['Clear Homebrew cache', 'brew tap --repair', 'brew_repair_output_file', 'brew_repair_status'],
    ['Clear old Ruby gem versions', 'gem cleanup', 'output_file', 'command_status'],
    ['Clear unused Docker data', 'docker system prune -af', 'output_file', 'command_status'],
    ['Clear NPM cache', 'npm cache clean --force', 'output_file', 'command_status'],
    ['Clear Yarn cache', 'yarn cache clean --force', 'output_file', 'command_status'],
    ['Remove Google Software Update service', '$googleUpdateFile --nuke', 'output_file', 'command_status'],
  ])('replays stdout and preserves the failure status when %s fails', (scriptName, command, outputFile, statusVariable) => {
    // Given
    const collection = application.getCollection(OperatingSystem.macOS);

    // When
    const generatedCode = collection.getScript(scriptName).code.execute;

    // Then
    expect(generatedCode).toContain(`${command} > "$${outputFile}"`);
    expect(generatedCode).not.toContain(`${command} > /dev/null`);
    expect(generatedCode).not.toContain(`${command} > "$${outputFile}" 2>`);
    expect(generatedCode).not.toContain(`${command} 2>&1`);
    expect(generatedCode).toMatch(new RegExp(`${outputFile}="\\$\\(mktemp\\)" \\|\\| exit 1\\n\\s+trap 'rm -f "\\$${outputFile}"' EXIT`));
    expect(generatedCode).not.toMatch(new RegExp(`\\n\\s+rm -f "\\$${outputFile}"\\n`));
    expect(generatedCode).toContain(`${statusVariable}=$?`);
    expect(generatedCode).toContain(`if [ "$${statusVariable}" -ne 0 ]; then`);
    expect(generatedCode).toContain(`cat "$${outputFile}"`);
    expect(generatedCode).toContain(`exit "$${statusVariable}"`);
  });
});
