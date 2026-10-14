import { writeFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createScriptCompiler } from '@/application/Application/Loader/Collections/Compiler/Executable/Script/Compiler/ScriptCompilerFactory';
import WindowsCollection from '@/application/collections/windows.yaml';
import type { ExecutableData, FunctionCallParametersData, ScriptData } from '@/application/collections/';
import { ScriptLanguage } from '@/domain/ScriptMetadata/ScriptLanguage';

// Inert export only. The separately guarded VM harness is the sole execution entry point.
describe('Windows cleanup VM payload', () => {
  it('compiles fixture-scoped payloads without executing them', () => {
    const compiler = createScriptCompiler({
      categoryContext: {
        functions: WindowsCollection.functions ?? [],
        language: ScriptLanguage.batchfile,
      },
    });
    const oneDrive = listScripts(WindowsCollection.actions)
      .find((script) => script.name === 'Remove OneDrive user data and synced folders');
    if (!oneDrive || !('call' in oneDrive) || !oneDrive.call || !('function' in oneDrive.call)) {
      throw new Error('Expected the OneDrive directory cleanup call.');
    }
    const preservationCallback = oneDrive.call.parameters?.duringIteration;
    if (!preservationCallback) {
      throw new Error('Expected the production OneDrive preservation callback.');
    }

    const definitions: readonly VmFixture[] = [
      { id: 'normal' },
      { id: 'contents', helper: 'ClearDirectoryContents' },
      { id: 'files', helper: 'DeleteFiles', suffix: '\\*' },
      { id: 'empty' },
      { id: 'missing' },
      { id: 'multiple', suffix: '\\cache*' },
      { id: 'deep-wide' },
      { id: 'locked', grant: true },
      { id: 'deny-no-repair', helper: 'DeleteFiles', suffix: '\\*' },
      {
        id: 'deny-repair', helper: 'DeleteFiles', suffix: '\\*', grant: true,
      },
      { id: 'repair-file', grant: true },
      { id: 'deny-enumeration', grant: true },
      { id: 'repair-enumeration', grant: true },
      { id: 'combined-denial', grant: true },
      { id: 'junctions' },
      { id: 'root-junction', suffix: '\\alias' },
      { id: 'ancestor-junction', suffix: '\\alias\\child' },
      { id: 'file-symlink' },
      {
        id: 'callbacks',
        parameters: {
          beforeIteration: '$vmCallbackCount = 0',
          duringIteration: '$vmCallbackCount++; if ($path.EndsWith(".keep")) { $skippedCount++; continue }',
        },
      },
      {
        id: 'changing-tree',
        parameters: {
          duringIteration: 'if ($item.PSIsContainer) { [IO.File]::WriteAllText((Join-Path $path "late.txt"), "late") }',
        },
      },
      { id: 'onedrive-callback', parameters: { duringIteration: preservationCallback } },
    ];

    const cases = definitions.map((fixture) => {
      const helper = fixture.helper ?? 'DeleteDirectory';
      const target = `%PRIVACY_SEXY_VM_FIXTURE%\\${fixture.id}${fixture.suffix ?? ''}`;
      const code = compiler.compile({
        name: `VM fixture ${fixture.id}`,
        call: {
          function: helper,
          parameters: {
            [helper === 'DeleteFiles' ? 'fileGlob' : 'directoryGlob']: target,
            ...(fixture.grant ? { grantPermissions: 'true' } : {}),
            ...fixture.parameters,
          },
        },
      }).execute;
      const commandLines = code.split(/\r?\n/).filter((line) => line.startsWith('PowerShell '));
      expect(commandLines, fixture.id).toHaveLength(1);
      const match = commandLines[0]?.match(/^PowerShell .*?-Command "(.*)"$/);
      if (!match?.[1]) {
        throw new Error(`Expected a compiled PowerShell command for ${fixture.id}.`);
      }
      expect(code, fixture.id).toContain('%PRIVACY_SEXY_VM_FIXTURE%');
      expect(commandLines[0]?.length, fixture.id).toBeLessThanOrEqual(8191);
      return { id: fixture.id, body: match[1].replaceAll('"^""', '"') };
    });

    expect(cases).toHaveLength(21);
    const output = process.env.PRIVACY_SEXY_VM_PAYLOAD;
    if (output) {
      if (!output.endsWith('.json')) {
        throw new Error('VM payload exports must be inert JSON files.');
      }
      writeFileSync(output, JSON.stringify({ schema: 1, cases }));
    }
  });
});

interface VmFixture {
  readonly id: string;
  readonly helper?: 'DeleteDirectory' | 'ClearDirectoryContents' | 'DeleteFiles';
  readonly suffix?: string;
  readonly grant?: boolean;
  readonly parameters?: FunctionCallParametersData;
}

function listScripts(nodes: readonly ExecutableData[]): ScriptData[] {
  return nodes.flatMap((node) => ('children' in node ? listScripts(node.children) : [node]));
}
