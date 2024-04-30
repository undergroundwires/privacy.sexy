import { OperatingSystem } from '@/domain/OperatingSystem';
import { CurrentEnvironment } from '@/infrastructure/RuntimeEnvironment/RuntimeEnvironmentFactory';
import type { RuntimeEnvironment } from '@/infrastructure/RuntimeEnvironment/RuntimeEnvironment';
import { WindowsVisibleTerminalCommand } from '../Commands/WindowsVisibleTerminalCommand';
import { LinuxVisibleTerminalCommand } from '../Commands/LinuxVisibleTerminalCommand';
import { MacOsVisibleTerminalCommand } from '../Commands/MacOsVisibleTerminalCommand';
import type { CommandDefinitionFactory } from './CommandDefinitionFactory';
import type { CommandDefinition } from '../CommandDefinition';

export class OsSpecificTerminalLaunchCommandFactory implements CommandDefinitionFactory {
  constructor(
    private readonly environment: RuntimeEnvironment = CurrentEnvironment,
  ) { }

  public provideCommandDefinition(): CommandDefinition {
    const { os } = this.environment;
    if (os === undefined) {
      throw new Error('Operating system could not be identified from environment.');
    }
    return getOperatingSystemCommandDefinition(os);
  }
}

function getOperatingSystemCommandDefinition(
  operatingSystem: OperatingSystem,
): CommandDefinition {
  const definition = SupportedDesktopCommandDefinitions[operatingSystem];
  if (!definition) {
    throw new Error(`Unsupported operating system: ${OperatingSystem[operatingSystem]}`);
  }
  return definition;
}

const SupportedDesktopCommandDefinitions: Readonly<Partial<Record<
OperatingSystem,
CommandDefinition>>> = {
  [OperatingSystem.Windows]: new WindowsVisibleTerminalCommand(),
  [OperatingSystem.Linux]: new LinuxVisibleTerminalCommand(),
  [OperatingSystem.macOS]: new MacOsVisibleTerminalCommand(),
} as const;
