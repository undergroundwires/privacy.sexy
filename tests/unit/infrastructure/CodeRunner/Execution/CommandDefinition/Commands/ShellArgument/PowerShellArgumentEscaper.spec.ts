import { describe } from 'vitest';
import { PowerShellArgumentEscaper } from '@/infrastructure/CodeRunner/Execution/CommandDefinition/Commands/ShellArgument/PowerShellArgumentEscaper';
import { runEscapeTests } from './ShellArgumentEscaperTestRunner';

describe('PowerShellArgumentEscaper', () => {
  runEscapeTests(() => new PowerShellArgumentEscaper(), [
    {
      description: 'encloses the path in single quotes',
      givenPath: 'C:\\Program Files\\app.exe',
      expectedPath: '\'C:\\Program Files\\app.exe\'',
    },
    {
      description: 'escapes single internal single quotes',
      givenPath: 'C:\\Users\\O\'Reilly\\Documents',
      expectedPath: '\'C:\\Users\\O\'\'Reilly\\Documents\'',
    },
    {
      description: 'escapes multiple internal single quotes',
      givenPath: 'C:\\Program Files\\User\'s Files\\Today\'s Files',
      expectedPath: '\'C:\\Program Files\\User\'\'s Files\\Today\'\'s Files\'',
    },
  ]);
});
