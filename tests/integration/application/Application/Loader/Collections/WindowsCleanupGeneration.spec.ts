import {
  beforeAll, describe, expect, it,
} from 'vitest';
import { loadApplicationComposite } from '@/application/Application/Loader/CompositeApplicationLoader';
import { createScriptCompiler } from '@/application/Application/Loader/Collections/Compiler/Executable/Script/Compiler/ScriptCompilerFactory';
import WindowsCollection from '@/application/collections/windows.yaml';
import type { FunctionCallParametersData } from '@/application/collections/';
import type { CategoryCollection } from '@/domain/Collection/CategoryCollection';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { ScriptLanguage } from '@/domain/ScriptMetadata/ScriptLanguage';
import { BASE_APP_COMPILATION_TIMEOUT_MS } from '@tests/shared/TestTiming';
import { UserScriptGenerator } from '@/application/Context/State/Code/Generation/UserScriptGenerator';
import { UserSelectedScript } from '@/application/Context/State/Selection/Script/UserSelectedScript';

// Generate and inspect text only: these cleanup commands must never run on the test host.
describe('Windows cleanup generation', () => {
  let collection: CategoryCollection;

  beforeAll(() => {
    collection = loadApplicationComposite().getCollection(OperatingSystem.Windows);
  }, BASE_APP_COMPILATION_TIMEOUT_MS);

  it.each([
    'Clear previous Windows installations',
    'Clear Windows update files',
    'Remove OneDrive user data and synced folders',
  ])('avoids whole-tree discovery and recursive deletion in %s', (name) => {
    const code = collection.getScript(name).code.execute;

    expect(code).not.toMatch(/Get-ChildItem[^;\n]*-Recurse/);
    expect(code).not.toMatch(/Remove-Item[^;\n]*-Recurse/);
    expect(code).not.toContain('$foundAbsolutePaths');
    expect(code).not.toContain('Sort-Object');
    expect(code).toContain('[IO.Directory]::Delete($path, $false)');
  });

  it('retains the selected directory when clearing only its contents', () => {
    const code = compileCleanup('ClearDirectoryContents', { directoryGlob: 'C:\\Fixture\\Cache' });

    expect(code).toContain("$keepRoot = $recurse -and $expandedPath.EndsWith('\\*')");
    expect(code).toContain('$rootPattern = $expandedPath.Substring(0, $expandedPath.Length - 1)');
    expect(code).toContain('if (-not $frame.Keep)');
  });

  it('uses literal paths after initial glob resolution', () => {
    const code = compileCleanup('DeleteDirectory', { directoryGlob: 'C:\\Fixture\\Cache[1]' });

    expect(code).toContain('Get-Item -LiteralPath $path');
    expect(code).toContain('Get-ChildItem -LiteralPath $path');
    expect(code).toContain('[IO.File]::Delete($path)');
    expect(code).not.toContain('Remove-Item -Path $path');
  });

  it('checks reparse points and lexical ancestors before descending', () => {
    const code = compileCleanup('DeleteDirectory', { directoryGlob: 'C:\\Fixture\\Cache' });

    expect(code).toContain('[IO.FileAttributes]::ReparsePoint');
    expect(code).toContain('[IO.Path]::GetDirectoryName');
    expect(code.indexOf('[IO.FileAttributes]::ReparsePoint'))
      .toBeLessThan(code.indexOf('Get-ChildItem -LiteralPath $path'));
    expect(code).toContain('$scheduled.Add(');
  });

  it('repairs permissions only once per denied path without recursive native tools', () => {
    const code = compileCleanup('DeleteDirectory', {
      directoryGlob: 'C:\\Fixture\\Windows.old',
      grantPermissions: 'true',
    });

    expect(code).toContain('UnauthorizedAccessException');
    expect(code).toContain('$repairAttempted.Add($target)');
    expect(code).toContain("'' | &");
    expect(code).toContain("'*S-1-5-32-544:F'");
    expect(code).not.toMatch(/takeown[^;\n]* \/r\b/i);
    expect(code).not.toMatch(/icacls[^;\n]* \/t\b/i);
    expect(code).toContain('$takeOwnershipOutput = @(');
    expect(code).toContain('$icaclsOutput = @(');
  });

  it('does not change permissions when permission granting was not selected', () => {
    const code = compileCleanup('DeleteDirectory', { directoryGlob: 'C:\\Fixture\\Cache' });

    expect(code).not.toContain('takeown.exe');
    expect(code).not.toContain('icacls.exe');
    expect(code).not.toContain('Repair-CleanupAccess');
  });

  it('excludes directories using inspected metadata for file-only cleanup', () => {
    const code = compileCleanup('DeleteFiles', { fileGlob: 'C:\\Fixture\\*' });

    expect(code).toMatch(/if \(\$item\.PSIsContainer\) \{[^}]*\$skippedCount\+\+; continue;/);
    expect(code).not.toContain('Test-Path');
  });

  it('keeps per-path cleanup progress in the verbose stream', () => {
    const code = compileCleanup('DeleteDirectory', { directoryGlob: 'C:\\Fixture\\Cache' });

    expect(code).toMatch(/Write-Verbose "[^";]*\$path"; \$children = @\(Get-ChildItem/);
    expect(code).toMatch(/Write-Verbose "[^";]*\$path"; \$attributes = \[IO.File\]::GetAttributes/);
  });

  it.each([
    'Clear previous Windows installations',
    'Clear Windows update files',
    'Remove OneDrive user data and synced folders',
  ])('builds a complete downloadable artifact within batch line limits: %s', (name) => {
    const script = collection.getScript(name);
    const output = new UserScriptGenerator().buildCode(
      [new UserSelectedScript(script, false)],
      collection.scriptMetadata,
    );

    const normalizedCode = output.code.replaceAll('\r\n', '\n');
    expect(normalizedCode).toContain(script.code.execute.replaceAll('\r\n', '\n'));
    expect(normalizedCode).toContain(collection.scriptMetadata.startCode.replaceAll('\r\n', '\n'));
    expect(normalizedCode).toContain(collection.scriptMetadata.endCode.replaceAll('\r\n', '\n'));
    expect(Math.max(...output.code.split(/\r?\n/).map((line) => line.length))).toBeLessThanOrEqual(8191);
  });

  it('preserves injected callbacks and their direct loop control', () => {
    const code = compileCleanup('DeleteGlob', {
      pathGlob: 'C:\\Fixture\\*',
      recurse: 'true',
      beforeIteration: '$callbackBefore = 17',
      duringIteration: 'if ($path.EndsWith(".keep")) { continue }',
      afterIteration: '$callbackAfter = 29',
    });

    expect(code).toContain('$callbackBefore = 17');
    expect(code).toContain('if ($path.EndsWith(".keep")) { continue }');
    expect(code).toContain('$callbackAfter = 29');
    expect(code.indexOf('if ($path.EndsWith')).toBeLessThan(code.indexOf('[IO.File]::Delete($path)'));
  });

  it('does not add guessed time limits or retry-until-empty loops', () => {
    const code = compileCleanup('DeleteDirectory', {
      directoryGlob: 'C:\\Fixture\\Windows.old',
      grantPermissions: 'true',
    });

    expect(code).not.toMatch(/Start-Sleep|Stopwatch|Timeout|while\s*\(\$true\)/i);
    expect(code).toContain('while ($pending.Count -gt 0)');
    expect(code).toContain('$failedCount');
    expect(code).toContain('$absentCount');
    expect(code).toContain('$linkCount');
  });

  it('generates comprehensive OneDrive application and shell removal', () => {
    const script = collection.getScript('Completely remove OneDrive application and shell integration');
    const code = script.code.execute.replaceAll('"^""', '"');

    expect(script.code.revert).toBeFalsy();
    expect(code).toContain('FileSyncShell*.dll');
    expect(code).toContain('regsvr32.exe');
    expect(code).toContain('/u /s');
    expect(code).toContain("'/allusers'");
    expect(code).toContain("$_.TaskName -like 'OneDrive*'");
    expect(code).toContain('Unregister-ScheduledTask');
    expect(code).toContain('sc.exe');
    expect(code).toContain("$displayName -eq 'Microsoft OneDrive'");
    expect(code).toMatch(/%PROGRAMFILES\(X86\)%.*Microsoft.*OneDrive/);
    expect(code).not.toContain('%USERPROFILE%\\OneDrive*');

    const output = new UserScriptGenerator().buildCode(
      [new UserSelectedScript(script, false)],
      collection.scriptMetadata,
    );
    expect(Math.max(...output.code.split(/\r?\n/).map((line) => line.length))).toBeLessThanOrEqual(8191);
  });
});

function compileCleanup(name: string, parameters: FunctionCallParametersData): string {
  const compiler = createScriptCompiler({
    categoryContext: {
      functions: WindowsCollection.functions ?? [],
      language: ScriptLanguage.batchfile,
    },
  });
  return compiler.compile({
    name: `Generate ${name}`,
    call: { function: name, parameters },
  }).execute.replaceAll('"^""', '"');
}
