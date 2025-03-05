import { describe } from 'vitest';
import { InlinePowerShell } from '@/application/Application/Loader/Collections/Compiler/Executable/Script/Compiler/Expressions/Pipes/PipeDefinitions/InlinePowerShell';
import { runPipeTests, type PipeTestScenario } from './PipeTestRunner';
import { createTryCatchFinallyTests } from './InlinePowerShellTests/CreateTryCatchFinallyTests';
import { createAbsentCodeTests } from './InlinePowerShellTests/CreateAbsentCodeTests';
import { createCommentedCodeTests } from './InlinePowerShellTests/CreateCommentedCodeTests';
import { createIfStatementTests } from './InlinePowerShellTests/CreateIfStatementTests';
import { createLineContinuationBacktickCases } from './InlinePowerShellTests/CreateLineContinuationBacktickTests';
import { createDoWhileTests } from './InlinePowerShellTests/CreateDoWhileTests';
import { createDoUntilTests } from './InlinePowerShellTests/CreateDoUntilTests';
import { createForeachTests } from './InlinePowerShellTests/CreateForeachTests';
import { createWhileTests } from './InlinePowerShellTests/CreateWhileTests';
import { createForLoopTests } from './InlinePowerShellTests/CreateForLoopTests';
import { createSwitchTests } from './InlinePowerShellTests/CreateSwitchTests';
import { createHereStringTests } from './InlinePowerShellTests/CreateHereStringTests';
import { createNewlineTests } from './InlinePowerShellTests/CreateNewlineTests';
import { createFunctionTests } from './InlinePowerShellTests/CreateFunctionTests';
import { createScriptBlockTests } from './InlinePowerShellTests/CreateScriptBlockTests';

describe('InlinePowerShell', () => {
  // arrange
  const sut = new InlinePowerShell();
  // act
  runPipeTests(sut, [
    ...prefixTests('absent code', createAbsentCodeTests()),
    ...prefixTests('newline', createNewlineTests()),
    ...prefixTests('comment', createCommentedCodeTests()),
    ...prefixTests('here-string', createHereStringTests()),
    ...prefixTests('line continuation backtick', createLineContinuationBacktickCases()),
    ...prefixTests('try-catch-finally', createTryCatchFinallyTests()),
    ...prefixTests('if statement', createIfStatementTests()),
    ...prefixTests('do-while loop', createDoWhileTests()),
    ...prefixTests('do-until loop', createDoUntilTests()),
    ...prefixTests('foreach loop', createForeachTests()),
    ...prefixTests('while loop', createWhileTests()),
    ...prefixTests('for loop', createForLoopTests()),
    ...prefixTests('switch statement', createSwitchTests()),
    ...prefixTests('function', createFunctionTests()),
    ...prefixTests('script block', createScriptBlockTests()),
  ]);
});

function prefixTests(prefix: string, tests: PipeTestScenario[]): PipeTestScenario[] {
  return tests.map((test) => ({
    ...test,
    ...{
      description: `[${prefix}] ${test.description}`,
    },
  }));
}
