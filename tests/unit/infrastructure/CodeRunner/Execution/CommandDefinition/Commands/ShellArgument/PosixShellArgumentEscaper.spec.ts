import { describe } from 'vitest';
import { PosixShellArgumentEscaper } from '@/infrastructure/CodeRunner/Execution/CommandDefinition/Commands/ShellArgument/PosixShellArgumentEscaper';
import { runEscapeTests } from './ShellArgumentEscaperTestRunner';

describe('PosixShellArgumentEscaper', () => {
  runEscapeTests(() => new PosixShellArgumentEscaper(), [
    {
      description: 'encloses the path in quotes',
      givenPath: '/usr/local/bin',
      expectedPath: '\'/usr/local/bin\'',
    },
    {
      description: 'escapes single quotes in path',
      givenPath: 'f\'i\'le',
      expectedPath: '\'f\'\\\'\'i\'\\\'\'le\'',
    },
  ]);
});
