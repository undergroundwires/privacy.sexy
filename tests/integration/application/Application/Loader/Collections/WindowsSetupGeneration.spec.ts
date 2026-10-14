import {
  beforeAll, describe, expect, it,
} from 'vitest';
import WindowsCollection from '@/application/collections/windows.yaml';
import { loadApplicationComposite } from '@/application/Application/Loader/CompositeApplicationLoader';
import { createScriptCompiler } from '@/application/Application/Loader/Collections/Compiler/Executable/Script/Compiler/ScriptCompilerFactory';
import type { CategoryCollection } from '@/domain/Collection/CategoryCollection';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { ScriptLanguage } from '@/domain/ScriptMetadata/ScriptLanguage';
import { BASE_APP_COMPILATION_TIMEOUT_MS } from '@tests/shared/TestTiming';

describe('Windows setup generation', () => {
  const compiler = createScriptCompiler({
    categoryContext: {
      functions: WindowsCollection.functions ?? [],
      language: ScriptLanguage.batchfile,
    },
  });

  describe.each([false, true])('with TrustedInstaller elevation set to %s', (elevated) => {
    it('places the unelevated guard before both apply and revert operations', () => {
      const guard = "if ($env:SETUP_TEST -eq 'skip') { Exit 0 }";
      const script = compiler.compile({
        name: 'Guarded operation',
        call: {
          function: 'RunPowerShellWithOptionalElevation',
          parameters: {
            setupCodeUnelevated: guard,
            code: "Write-Output 'apply-operation'",
            revertCode: "Write-Output 'revert-operation'",
            ...(elevated ? { elevateToTrustedInstaller: 'true' } : {}),
          },
        },
      });

      [script.execute, script.revert ?? ''].forEach((code) => {
        expect(code).toContain("$env:SETUP_TEST -eq 'skip'");
        expect(code.indexOf('$env:SETUP_TEST')).toBeLessThan(code.indexOf('-operation'));
      });
    });
  });

  it('retains the server-side TLS skip guard without skipping client configuration', () => {
    const script = compiler.compile({
      name: 'Client-only TLS key size',
      call: {
        function: 'RequireTLSMinimumKeySize',
        parameters: {
          algorithmName: 'PKCS',
          keySizeInBits: '2048',
          ignoreServerSide: 'true',
        },
      },
    });

    [script.execute, script.revert ?? ''].forEach((code) => {
      const serverLine = code.split('\n').find((line) => line.includes("/v 'ServerMinKeyBitLength'")) ?? '';
      const clientLine = code.split('\n').find((line) => line.includes("/v 'ClientMinKeyBitLength'")) ?? '';
      expect(serverLine).toContain('Exit 0');
      expect(serverLine.indexOf('Exit 0')).toBeLessThan(serverLine.indexOf('reg '));
      expect(clientLine).toContain('reg ');
      expect(clientLine).not.toContain('Exit 0');
    });
  });

  describe('CPU-specific mitigation guards', () => {
    let collection: CategoryCollection;

    beforeAll(() => {
      collection = loadApplicationComposite().getCollection(OperatingSystem.Windows);
    }, BASE_APP_COMPILATION_TIMEOUT_MS);

    it.each(['Intel', 'AMD'])('retains the %s guard on apply and revert', (cpu) => {
      const script = collection.getScript('Mitigate Spectre Variant 2 and Meltdown in host operating system');
      const guard = `$cpuName -NotMatch '${cpu}'`;

      [script.code.execute, script.code.revert ?? ''].forEach((code) => {
        const guardedLine = code.split('\n').find((line) => line.includes(guard)) ?? '';
        expect(guardedLine).toContain(guard);
        expect(guardedLine).toContain("/v 'FeatureSettingsOverride'");
        expect(guardedLine.indexOf(guard)).toBeLessThan(guardedLine.indexOf('reg '));
      });
    });
  });
});
