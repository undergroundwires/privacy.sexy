import 'mocha';
import { runPipeTests } from './PipeTestRunner';
import { EscapeDoubleQuotes } from '@/application/Parser/Script/Compiler/Expressions/Pipes/PipeDefinitions/EscapeDoubleQuotes';

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
        {
            name: 'returns undefined when if input is undefined',
            input: undefined,
            expectedOutput: undefined,
        },
    ]);
});
