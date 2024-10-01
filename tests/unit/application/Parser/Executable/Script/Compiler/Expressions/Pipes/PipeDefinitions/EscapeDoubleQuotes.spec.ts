import { describe } from 'vitest';
import { EscapeDoubleQuotes } from '@/application/Parser/Executable/Script/Compiler/Expressions/Pipes/PipeDefinitions/EscapeDoubleQuotes';
import { getAbsentStringTestCases } from '@tests/unit/shared/TestCases/AbsentTests';
import { runPipeTests, type PipeTestScenario } from './PipeTestRunner';

describe('EscapeDoubleQuotes', () => {
  // arrange
  const sut = new EscapeDoubleQuotes();
  // act
  runPipeTests(sut, [
    ...getAbsentStringTestCases({ excludeNull: true, excludeUndefined: true })
      .map((testCase): PipeTestScenario => ({
        description: `returns empty when if input is missing (${testCase.valueName})`,
        input: testCase.absentValue,
        expectedOutput: '',
      })),
    {
      description: 'using "',
      input: 'hello "world"',
      expectedOutput: 'hello "^""world"^""',
    },
    {
      description: 'not using any double quotes',
      input: 'hello world',
      expectedOutput: 'hello world',
    },
    {
      description: 'consecutive double quotes',
      input: '""hello world""',
      expectedOutput: '"^"""^""hello world"^"""^""',
    },
  ]);
});
