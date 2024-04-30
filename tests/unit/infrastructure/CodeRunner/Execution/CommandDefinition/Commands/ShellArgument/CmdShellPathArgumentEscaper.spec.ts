import { describe } from 'vitest';
import { CmdShellArgumentEscaper } from '@/infrastructure/CodeRunner/Execution/CommandDefinition/Commands/ShellArgument/CmdShellArgumentEscaper';
import { runEscapeTests } from './ShellArgumentEscaperTestRunner';

describe('CmdShellArgumentEscaper', () => {
  runEscapeTests(() => new CmdShellArgumentEscaper(), [
    {
      description: 'encloses the path in double quotes',
      givenPath: 'C:\\Program Files\\app.exe',
      expectedPath: '"C:\\Program Files\\app.exe"',
    },
  ]);
});
