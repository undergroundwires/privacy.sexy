import 'mocha';
import { InlinePowerShell } from '@/application/Parser/Script/Compiler/Expressions/Pipes/PipeDefinitions/InlinePowerShell';
import { runPipeTests } from './PipeTestRunner';

describe('InlinePowerShell', () => {
    // arrange
    const sut = new InlinePowerShell();
    // act
    runPipeTests(sut, [
        {
            name: 'no new line',
            input: 'Write-Host \'Hello, World!\'',
            expectedOutput: 'Write-Host \'Hello, World!\'',
        },
        {
            name: '\\n new line',
            input: '$things = Get-ChildItem C:\\Windows\\\nforeach ($thing in $things) {\nWrite-Host $thing.Name -ForegroundColor Magenta\n}',
            expectedOutput: '$things = Get-ChildItem C:\\Windows\\; foreach ($thing in $things) {; Write-Host $thing.Name -ForegroundColor Magenta; }',
        },
        {
            name: '\\n double empty lines are ignored',
            input: '$things = Get-ChildItem C:\\Windows\\\n\nforeach ($thing in $things) {\n\nWrite-Host $thing.Name -ForegroundColor Magenta\n\n\n}',
            expectedOutput: '$things = Get-ChildItem C:\\Windows\\; foreach ($thing in $things) {; Write-Host $thing.Name -ForegroundColor Magenta; }',
        },
        {
            name: '\\r new line',
            input: '$things = Get-ChildItem C:\\Windows\\\rforeach ($thing in $things) {\rWrite-Host $thing.Name -ForegroundColor Magenta\r}',
            expectedOutput: '$things = Get-ChildItem C:\\Windows\\; foreach ($thing in $things) {; Write-Host $thing.Name -ForegroundColor Magenta; }',
        },
        {
            name: '\\r and \\n newlines combined',
            input: '$things = Get-ChildItem C:\\Windows\\\r\nforeach ($thing in $things) {\n\rWrite-Host $thing.Name -ForegroundColor Magenta\n\r}',
            expectedOutput: '$things = Get-ChildItem C:\\Windows\\; foreach ($thing in $things) {; Write-Host $thing.Name -ForegroundColor Magenta; }',
        },
        {
            name: 'trims whitespaces on lines',
            input: ' $things = Get-ChildItem C:\\Windows\\   \nforeach ($thing in $things) {\n\tWrite-Host $thing.Name -ForegroundColor Magenta\r       \n}',
            expectedOutput: '$things = Get-ChildItem C:\\Windows\\; foreach ($thing in $things) {; Write-Host $thing.Name -ForegroundColor Magenta; }',
        },
        {
            name: 'returns undefined when if input is undefined',
            input: undefined,
            expectedOutput: undefined,
        },
    ]);
});

