import { describe, it, expect } from 'vitest';
import type { RuntimeEnvironment } from '@/infrastructure/RuntimeEnvironment/RuntimeEnvironment';
import { ScriptEnvironmentDiagnosticsCollector } from '@/infrastructure/ScriptDiagnostics/ScriptEnvironmentDiagnosticsCollector';
import { RuntimeEnvironmentStub } from '@tests/unit/shared/Stubs/RuntimeEnvironmentStub';
import { ApplicationDirectoryProviderStub } from '@tests/unit/shared/Stubs/ApplicationDirectoryProviderStub';
import { OperatingSystem } from '@/domain/OperatingSystem';
import type { ApplicationDirectoryProvider } from '@/infrastructure/FileSystem/Directory/ApplicationDirectoryProvider';

describe('ScriptEnvironmentDiagnosticsCollector', () => {
  it('collects operating system path correctly', async () => {
    // arrange
    const expectedOperatingSystem = OperatingSystem.KaiOS;
    const environment = new RuntimeEnvironmentStub()
      .withOs(expectedOperatingSystem);
    const collector = new CollectorBuilder()
      .withEnvironment(environment)
      .build();

    // act
    const diagnosticData = await collector.collectDiagnosticInformation();

    // assert
    const actualOperatingSystem = diagnosticData.currentOperatingSystem;
    expect(actualOperatingSystem).to.equal(expectedOperatingSystem);
  });
  it('collects path correctly', async () => {
    // arrange
    const expectedScriptsPath = '/expected/scripts/path';
    const directoryProvider = new ApplicationDirectoryProviderStub()
      .withDirectoryPath('script-runs', expectedScriptsPath);
    const collector = new CollectorBuilder()
      .withScriptDirectoryProvider(directoryProvider)
      .build();

    // act
    const diagnosticData = await collector.collectDiagnosticInformation();

    // assert
    const actualScriptsPath = diagnosticData.scriptsDirectoryAbsolutePath;
    expect(actualScriptsPath).to.equal(expectedScriptsPath);
  });
});

class CollectorBuilder {
  private directoryProvider: ApplicationDirectoryProvider = new ApplicationDirectoryProviderStub();

  private environment: RuntimeEnvironment = new RuntimeEnvironmentStub();

  public withEnvironment(environment: RuntimeEnvironment): this {
    this.environment = environment;
    return this;
  }

  public withScriptDirectoryProvider(directoryProvider: ApplicationDirectoryProvider): this {
    this.directoryProvider = directoryProvider;
    return this;
  }

  public build() {
    return new ScriptEnvironmentDiagnosticsCollector(
      this.directoryProvider,
      this.environment,
    );
  }
}
