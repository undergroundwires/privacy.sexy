import {
  beforeAll, describe, expect, it,
} from 'vitest';
import { loadApplicationComposite } from '@/application/Application/Loader/CompositeApplicationLoader';
import type { CategoryCollection } from '@/domain/Collection/CategoryCollection';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { BASE_APP_COMPILATION_TIMEOUT_MS } from '@tests/shared/TestTiming';

describe('Windows policy generation', () => {
  let collection: CategoryCollection;

  beforeAll(() => {
    collection = loadApplicationComposite().getCollection(OperatingSystem.Windows);
  }, BASE_APP_COMPILATION_TIMEOUT_MS);

  it('targets the current Recall snapshot policy when generating apply code', () => {
    const script = collection.getScript('Disable Recall');
    const code = script.code.execute;

    expect(code).toContain("reg add 'HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\WindowsAI'");
    expect(code).toContain("/v 'DisableAIDataAnalysis'");
    expect(code).toContain("/t 'REG_DWORD'");
    expect(code).toContain("/d '1'");
    expect(code).not.toContain('WindowsCopilot');
    expect(code).toContain('[Environment]::OSVersion.Version.Build -lt 26100');
  });

  it('removes the current Recall policy value when generating revert code', () => {
    const code = collection.getScript('Disable Recall').code.revert;

    expect(code).toContain("reg delete 'HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\WindowsAI'");
    expect(code).toContain("/v 'DisableAIDataAnalysis'");
    expect(code).not.toContain('WindowsCopilot');
    expect(code).not.toContain('reg add');
    expect(code).toContain('[Environment]::OSVersion.Version.Build -lt 26100');
  });

  it.each([
    'Disable Copilot feature',
    'Disable Copilot access',
    'Disable Copilot auto-launch on start',
    'Remove "Copilot" icon from taskbar',
  ])('preserves %s for manual legacy use without recommending it', (scriptId) => {
    const script = collection.getScript(scriptId);

    expect(script.level).toBeUndefined();
    expect(script.code.execute).not.toHaveLength(0);
    expect(script.canRevert()).toBe(true);
  });

  it.each([
    {
      scriptId: 'Disable Defender Antivirus "Extended Cloud Check" feature',
      property: 'CloudExtendedTimeout',
      registryValue: 'MpBafsExtendedTimeout',
    },
    {
      scriptId: 'Disable Defender Antivirus aggressive cloud protection',
      property: 'CloudBlockLevel',
      registryValue: 'MpCloudBlockLevel',
    },
  ])('uses zero consistently for $property across preference and registry writes', ({
    scriptId, property, registryValue,
  }) => {
    const lines = collection.getScript(scriptId).code.execute.split('\n');
    const preferenceLine = lines.find((line) => line.includes(`$propertyName = '${property}'`)) ?? '';
    const registryLines = lines.filter((line) => line.includes(`/v '${registryValue}'`));

    expect(preferenceLine).toMatch(/\$value\s*=\s*'0'/);
    expect(registryLines).toHaveLength(2);
    registryLines.forEach((line) => {
      expect(line).toMatch(/\$data\s*=\s*'0'/);
    });
  });

  it('sets each Defender preference once rather than repeating it through Invoke-Expression', () => {
    const code = collection.getScript('Disable Defender Antivirus "Extended Cloud Check" feature').code.execute;

    expect(code).toContain('Set-MpPreference -Force -CloudExtendedTimeout $value -ErrorAction Stop');
    expect(code).not.toContain('Invoke-Expression');
  });
});
