import type { CommandDefinition } from '@/infrastructure/CodeRunner/Execution/CommandDefinition/CommandDefinition';
import type { CommandDefinitionFactory } from '@/infrastructure/CodeRunner/Execution/CommandDefinition/Factory/CommandDefinitionFactory';
import { CommandDefinitionStub } from './CommandDefinitionStub';

export class CommandDefinitionFactoryStub implements CommandDefinitionFactory {
  private definition: CommandDefinition = new CommandDefinitionStub();

  public withDefinition(definition: CommandDefinition): this {
    this.definition = definition;
    return this;
  }

  public provideCommandDefinition(): CommandDefinition {
    return this.definition;
  }
}
