import { describe, it, expect } from 'vitest';
import { OsSpecificTerminalLaunchCommandFactory } from '@/infrastructure/CodeRunner/Execution/CommandDefinition/Factory/OsSpecificTerminalLaunchCommandFactory';
import type { RuntimeEnvironment } from '@/infrastructure/RuntimeEnvironment/RuntimeEnvironment';
import { RuntimeEnvironmentStub } from '@tests/unit/shared/Stubs/RuntimeEnvironmentStub';
import { AllSupportedOperatingSystems, type SupportedOperatingSystem } from '@tests/shared/TestCases/SupportedOperatingSystems';
import type { CommandDefinition } from '@/infrastructure/CodeRunner/Execution/CommandDefinition/CommandDefinition';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { WindowsVisibleTerminalCommand } from '@/infrastructure/CodeRunner/Execution/CommandDefinition/Commands/WindowsVisibleTerminalCommand';
import type { Constructible } from '@/TypeHelpers';
import { LinuxVisibleTerminalCommand } from '@/infrastructure/CodeRunner/Execution/CommandDefinition/Commands/LinuxVisibleTerminalCommand';
import { MacOsVisibleTerminalCommand } from '@/infrastructure/CodeRunner/Execution/CommandDefinition/Commands/MacOsVisibleTerminalCommand';

describe('OsSpecificTerminalLaunchCommandFactory', () => {
  describe('returns expected definitions for supported operating systems', () => {
    const testScenarios: Record<SupportedOperatingSystem, Constructible<CommandDefinition>> = {
      [OperatingSystem.Windows]: WindowsVisibleTerminalCommand,
      [OperatingSystem.Linux]: LinuxVisibleTerminalCommand,
      [OperatingSystem.macOS]: MacOsVisibleTerminalCommand,
    };
    AllSupportedOperatingSystems.forEach((operatingSystem) => {
      it(`${OperatingSystem[operatingSystem]}`, () => {
        // arrange
        const expectedDefinitionType = testScenarios[operatingSystem];
        const context = new TestContext()
          .withOperatingSystem(operatingSystem);
        // act
        const actualDefinition = context.provideCommandDefinition();
        // assert
        expect(actualDefinition).to.be.instanceOf(expectedDefinitionType);
      });
    });
  });

  it('throws if the current operating system is undefined', () => {
    // arrange
    const expectedError = 'Operating system could not be identified from environment.';
    const operatingSystem = undefined;
    const context = new TestContext()
      .withOperatingSystem(operatingSystem);
    // act
    const act = () => context.provideCommandDefinition();
    // assert
    expect(act).to.throw(expectedError);
  });

  it('throws for an unsupported operating system', () => {
    // arrange
    const unsupportedOperatingSystem = OperatingSystem.BlackBerryOS;
    const expectedError = `Unsupported operating system: ${OperatingSystem[unsupportedOperatingSystem]}`;
    const context = new TestContext()
      .withOperatingSystem(unsupportedOperatingSystem);
    // act
    const act = () => context.provideCommandDefinition();
    // assert
    expect(act).to.throw(expectedError);
  });
});

class TestContext {
  private environment: RuntimeEnvironment = new RuntimeEnvironmentStub();

  public withOperatingSystem(os: OperatingSystem | undefined): this {
    this.environment = new RuntimeEnvironmentStub()
      .withOs(os);
    return this;
  }

  public provideCommandDefinition(): ReturnType<
  OsSpecificTerminalLaunchCommandFactory['provideCommandDefinition']
  > {
    const sut = new OsSpecificTerminalLaunchCommandFactory(this.environment);
    return sut.provideCommandDefinition();
  }
}
