import {
  beforeAll, describe, expect, it,
} from 'vitest';
import { loadApplicationComposite } from '@/application/Application/Loader/CompositeApplicationLoader';
import { createScriptCompiler } from '@/application/Application/Loader/Collections/Compiler/Executable/Script/Compiler/ScriptCompilerFactory';
import LinuxCollection from '@/application/collections/linux.yaml';
import type { FunctionCallParametersData } from '@/application/collections/';
import type { CategoryCollection } from '@/domain/Collection/CategoryCollection';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { ScriptLanguage } from '@/domain/ScriptMetadata/ScriptLanguage';
import { BASE_APP_COMPILATION_TIMEOUT_MS } from '@tests/shared/TestTiming';

// Generate and inspect text only. These cleanup commands must never run on the test host.
describe('Linux quiet output generation', () => {
  let collection: CategoryCollection;

  beforeAll(() => {
    collection = loadApplicationComposite().getCollection(OperatingSystem.Linux);
  }, BASE_APP_COMPILATION_TIMEOUT_MS);

  it('keeps removal commands quiet while retaining recursive and force options', () => {
    // Given
    const generatedCode = [
      ...collection.getAllScripts().flatMap(({ code }) => [code.execute, code.revert ?? '']),
      compileHelper('DeleteFileFromUserAndRootHome', { file: '.cache/fixture' }),
      compileHelper('DeleteFiles', { fileGlob: '$HOME/fixture/*' }),
      compileHelper('ClearDirectoryContents', { directoryGlob: '$HOME/fixture' }),
    ].join('\n');

    // When
    const hasVerboseRemoval = /\brm\s+-[a-z]*v[a-z]*\b/.test(generatedCode);

    // Then
    expect(hasVerboseRemoval).toBe(false);
    expect(generatedCode).toContain('rm -rf');
    expect(generatedCode).toContain('rm -f');
  });

  it('reports file cleanup once using actual removals and skipped non-files', () => {
    // Given
    const generatedCode = compileHelper('DeleteFiles', { fileGlob: '$HOME/fixture/*' });

    // When
    const includesPerFileSuccess = generatedCode.includes("print(f'Successfully delete file:");

    // Then
    expect(generatedCode).toContain('removed_count = 0');
    expect(generatedCode).toContain('skipped_count = 0');
    expect(generatedCode).toContain('removed_count += 1');
    expect(generatedCode).toContain('skipped_count += 1');
    expect(generatedCode).toContain("print(f'Removed {removed_count} file(s); skipped {skipped_count} non-file path(s).')");
    expect(generatedCode).not.toContain('len(paths)');
    expect(includesPerFileSuccess).toBe(false);
  });

  it('suppresses routine setting and database progress while preserving diagnostics', () => {
    // Given
    const settingsCode = compileHelper('SetVsCodeSetting', {
      setting: 'telemetry.telemetryLevel',
      jsonValue: '"off"',
    });
    const databaseCode = compileHelper('CleanTableFromFirefoxProfileDatabase', {
      databaseFileName: 'cookies.sqlite',
      tableName: 'moz_cookies',
    });

    // When
    const routineSettingProgress = settingsCode.includes("print(f'Reading file at");
    const routineDatabaseProgress = databaseCode.includes("print(f'Cleaning");

    // Then
    expect(routineSettingProgress).toBe(false);
    expect(routineDatabaseProgress).toBe(false);
    expect(settingsCode).toContain('file=sys.stderr');
    expect(settingsCode).toContain("print(f'Configured \"{property_name}\" in {configured_count} settings file(s).')");
    expect(settingsCode).toContain("print(f'Reverted \"{property_name}\" in {reverted_count} settings file(s).')");
    expect(databaseCode).toContain("print(f'Failed to delete from {file}: {e}', file=sys.stderr)");
    expect(databaseCode).toContain("print(f'Deleted {deleted_row_count} row(s) from {cleaned_database_count} database(s).')");
  });

  it('reports Firefox preference changes once while retaining conflict warnings', () => {
    // Given
    const generatedCode = compileHelper('AddFirefoxPrefs', {
      prefName: 'toolkit.telemetry.enabled',
      jsonValue: 'false',
    });

    // When
    const routineProfileProgress = generatedCode.includes('echo "$user_js_file:"')
      || generatedCode.includes('echo "$config_file_path:"');

    // Then
    expect(routineProfileProgress).toBe(false);
    expect(generatedCode).toContain('configured_profile_count=0');
    expect(generatedCode).toContain('reverted_preference_count=0');
    expect(generatedCode).toContain('>&2 echo');
    expect(generatedCode).toContain('Warning: Firefox is currently running.');
  });

  it('uses concise single-file summaries and replays package diagnostics on failure', () => {
    // Given
    const renameCode = compileHelper('RenameFile', { path: '/tmp/fixture' });
    const replaceCode = compileHelper('ReplaceFileContent', {
      filePath: '/tmp/fixture',
      newContent: 'updated',
    });
    const packageCode = [
      compileHelper('UninstallPacmanPackage', { packageName: 'fixture' }),
      compileHelper('UninstallRPMPackage', { packageName: 'fixture' }),
      compileHelper('UninstallAptPackage', { packageName: 'fixture' }),
    ].join('\n');

    // When
    const routineFileProgress = renameCode.includes('echo "File exists:')
      || replaceCode.includes('echo "Successfully backed up existing');

    // Then
    expect(routineFileProgress).toBe(false);
    expect(renameCode).toContain('echo "Renamed $file to $backup_file."');
    expect(replaceCode).toContain('echo "Replaced $file with requested content."');
    expect(replaceCode).toContain('>&2 echo "Skipping, original file missing at $file."');
    expect(packageCode).not.toContain('sudo pacman -Rcns "$pkg_package_name" --noconfirm > /dev/null');
    expect(packageCode).not.toContain('sudo dnf autoremove -y --skip-broken "$rpm_package_name" > /dev/null');
    expect(packageCode).not.toContain('sudo apt-get purge -y "$apt_package_name" > /dev/null');
    expect(packageCode).toContain('pacman_output="$(sudo pacman -Rcns "$pkg_package_name" --noconfirm)"');
    expect(packageCode).toContain('dnf_output="$(sudo dnf autoremove -y --skip-broken "$rpm_package_name")"');
    expect(packageCode).toContain('apt_output="$(sudo apt-get purge -y "$apt_package_name")"');
    expect(packageCode).not.toMatch(/(?:pacman|dnf|apt)_output="\$\([^\n]*2>&1/);
    expect(packageCode.match(/package_status=\$\?/g)).toHaveLength(6);
    expect(packageCode.match(/exit "\$package_status"/g)).toHaveLength(6);
  });

  it('keeps the elevation prompt and exit wait without the obsolete completion notices', () => {
    // Given
    const { endCode } = collection.scriptMetadata;

    // When
    const hasCompletionNotice = endCode.includes('Finished running selected actions.')
      || endCode.includes('Review the output above for errors or warnings.');

    // Then
    expect(hasCompletionNotice).toBe(false);
    expect(endCode).toContain("printf '%s\\n' ''");
    expect(endCode).toContain("echo 'Press any key to exit.'");
    expect(endCode).toContain('read -n 1 -s');
  });
});

function compileHelper(name: string, parameters: FunctionCallParametersData): string {
  const compiler = createScriptCompiler({
    categoryContext: {
      functions: LinuxCollection.functions ?? [],
      language: ScriptLanguage.shellscript,
    },
  });
  const code = compiler.compile({
    name: `Generate ${name}`,
    call: { function: name, parameters },
  });
  return [code.execute, code.revert ?? ''].join('\n');
}
