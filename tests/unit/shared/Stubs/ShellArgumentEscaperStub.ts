import type { ShellArgumentEscaper } from '@/infrastructure/CodeRunner/Execution/CommandDefinition/Commands/ShellArgument/ShellArgumentEscaper';
import { StubWithObservableMethodCalls } from './StubWithObservableMethodCalls';

export class ShellArgumentEscaperStub
  extends StubWithObservableMethodCalls<ShellArgumentEscaper>
  implements ShellArgumentEscaper {
  public escapePathArgument(pathArgument: string): string {
    this.registerMethodCall({
      methodName: 'escapePathArgument',
      args: [pathArgument],
    });
    return `[${ShellArgumentEscaperStub.name}] ${pathArgument}`;
  }
}
