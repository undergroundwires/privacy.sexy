import type { CommandDefinition } from '../CommandDefinition';

export interface CommandDefinitionFactory {
  provideCommandDefinition(): CommandDefinition;
}
