import { describe, expect, it } from 'vitest';
import { createScriptCompiler } from '@/application/Application/Loader/Collections/Compiler/Executable/Script/Compiler/ScriptCompilerFactory';
import WindowsCollection from '@/application/collections/windows.yaml';
import type { FunctionCallParametersData } from '@/application/collections/';
import { ScriptLanguage } from '@/domain/ScriptMetadata/ScriptLanguage';

describe('Windows quiet output generation', () => {
  it('keeps routine cleanup progress verbose while retaining diagnostics and its summary', () => {
    const code = compileCleanup('DeleteDirectory', {
      directoryGlob: 'C:\\Fixture\\Cache',
      grantPermissions: 'true',
    });

    expect(code).toContain('Write-Verbose "Resolving cleanup roots: $rootPattern"');
    expect(code).toContain('Write-Verbose "Checking root/ancestor: $ancestor"');
    expect(code).toContain('Write-Verbose "Inspecting: $path"');
    expect(code).toContain('Write-Verbose "Enumerating directory: $path"');
    expect(code).toContain('Write-Verbose "Deleting: $path"');
    expect(code).toContain('Write-Verbose "Deleted ($deletedCount): $path"');
    expect(code).toContain('Write-Verbose "Already absent: $path"');
    expect(code).toContain('Write-Host "Cleanup finished: deleted=$deletedCount; absent=$absentCount; preserved=$skippedCount; reparse=$linkCount; failed=$failedCount."');
    expect(code).toContain('Write-Warning "Root lookup failed: $rootPattern : $failure"');
    expect(code).toContain('Write-Warning "Retaining reparse point: $path"');
    expect(code).toContain('Write-Warning "Deletion failed; no subtree retry: $path : $_"');
  });

  it('captures native permission repair output and shows it only after a failed call', () => {
    const code = compileCleanup('DeleteDirectory', {
      directoryGlob: 'C:\\Fixture\\Cache',
      grantPermissions: 'true',
    });

    expect(code).toContain("$takeOwnershipOutput = @('' | &");
    expect(code).toContain("$icaclsOutput = @('' | &");
    expect(code).toContain('$ownerExit = $LASTEXITCODE');
    expect(code).toContain('$aclExit = $LASTEXITCODE');
    expect(code).toContain('Write-Warning "takeown.exe failed for $target with exit code $($ownerExit): $($takeOwnershipOutput -join [Environment]::NewLine)"');
    expect(code).toContain('Write-Warning "icacls.exe failed for $target with exit code $($aclExit): $($icaclsOutput -join [Environment]::NewLine)"');
  });

  it('keeps high-volume shared helper progress verbose while retaining warnings and summaries', () => {
    const softDeleteCode = compileFunction('SoftDeleteFiles', { fileGlob: 'C:\\Fixture\\Cache\\*' });
    const jsonCode = compileFunction('SetJsonPropertyValue', {
      jsonFilePath: 'C:\\Fixture\\settings.json',
      propertyKey: 'setting',
      powerShellValueExpression: '$true',
      deleteOnRevert: 'true',
    });
    const blockingCode = compileFunction('BlockExecutablesFromRunningViaShell', { executableNameWithExtension: 'sample.exe' });
    const placeholderCode = compileFunction('CreatePlaceholderFile', { placeholderFilePath: 'C:\\Fixture\\placeholder.txt' });
    const registryCode = compileFunction('SoftDeleteRegistryKey', { keyPath: 'HKCU\\Software\\Fixture' });

    expect(softDeleteCode).toContain('Write-Verbose "Processing file: `"$originalFilePath`"."');
    expect(softDeleteCode).toContain('Write-Host "Successfully processed $renamedCount items and skipped $skippedCount items."');
    expect(jsonCode).toContain('Write-Verbose "Successfully set \'$propertyKey\' in \'$jsonFilePath\'."');
    expect(jsonCode).toContain('Write-Verbose "Skipping, key \'$propertyKey\' already has value \'$desiredValue\'."');
    expect(blockingCode).toContain('Write-Verbose "Successfully blocked `"$executableFilename`" with rule index `"$nextFreeRuleIndex`"."');
    expect(blockingCode).toContain('Write-Warning \'Updating DisallowRun policy from unexpected value `"$currentDisallowRunPolicyValue`" to `"1`".\'');
    expect(placeholderCode).toContain('Write-Verbose "Successfully created a placeholder file at `"$expandedFilePath`"."');
    expect(placeholderCode).toContain('Write-Verbose "Skipping file creation as `"$expandedFilePath`" already exists."');
    expect(registryCode).toContain('Write-Verbose "Renaming \'$value\'"');
    expect(registryCode).toContain('Write-Warning "Failed to rename value: $_"');
    expect(registryCode).toContain('Write-Host "Total items: $totalItems, Renamed: $global:ok, Skipped: $global:skip, Failed: $global:fail"');
  });

  it('keeps direct action diagnostics while sending routine progress to the verbose stream', () => {
    const windowsSource = JSON.stringify(WindowsCollection);

    expect(windowsSource).toContain('echo Deleting event log: \\"%%i\\" >nul');
    expect(windowsSource).toContain('Write-Verbose \\"Deleting credential: `\\"$credentialTargetName`\\"...\\"');
    expect(windowsSource).toContain('Write-Error \\"Failed to delete credential \'$credentialTargetName\'. `cmdkey` returned exit code: $deleteExit. Details: $($deleteOutput -join [Environment]::NewLine)\\"');
    expect(windowsSource).toContain('Write-Verbose \\"Deleting $($_.Name) from Recycle Bin\\"');
    expect(windowsSource).toContain('Write-Verbose \\"Successfully disabled firewall.\\"');
    expect(windowsSource).toContain("Write-Warning 'Cannot use CLI because MpsSvc or MpsDrv is not running.");
    expect(windowsSource).not.toContain('Set-ItemProperty -Path \\"$key\\\\$($_.PSChildName)\\" -Name NetbiosOptions -Value 2 -Verbose');
  });
});

function compileCleanup(name: string, parameters: FunctionCallParametersData): string {
  return compileFunction(name, parameters);
}

function compileFunction(name: string, parameters: FunctionCallParametersData): string {
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
