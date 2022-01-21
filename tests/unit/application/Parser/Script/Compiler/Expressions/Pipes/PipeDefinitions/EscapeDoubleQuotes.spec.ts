import 'mocha';
import { EscapeDoubleQuotes } from '@/application/Parser/Script/Compiler/Expressions/Pipes/PipeDefinitions/EscapeDoubleQuotes';
import { AbsentStringTestCases } from '@tests/unit/shared/TestCases/AbsentTests';
import { runPipeTests } from './PipeTestRunner';

describe('EscapeDoubleQuotes', () => {
  // arrange
  const sut = new EscapeDoubleQuotes();
  // act
  runPipeTests(sut, [
    {
      name: 'using "',
      input: 'hello "world"',
      expectedOutput: 'hello "^""world"^""',
    },
    {
      name: 'not using any double quotes',
      input: 'hello world',
      expectedOutput: 'hello world',
    },
    {
      name: 'consecutive double quotes',
      input: '""hello world""',
      expectedOutput: '"^"""^""hello world"^"""^""',
    },
    ...AbsentStringTestCases.map((testCase) => ({
      name: 'returns as it is when if input is missing',
      input: testCase.absentValue,
      expectedOutput: testCase.absentValue,
    })),
  ]);
});
