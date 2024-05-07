import { describe, it, expect } from 'vitest';
import { EncodedPowerShellInvokeCmdCommandCreator } from '@/infrastructure/CodeRunner/Execution/CommandDefinition/Commands/PowerShellInvoke/EncodedPowerShellInvokeCmdCommandCreator';

describe('EncodedPowerShellInvokeCmdCommandCreator', () => {
  describe('createCommandToInvokePowerShell', () => {
    it('starts with PowerShell base command', () => {
      // arrange
      const sut = new EncodedPowerShellInvokeCmdCommandCreator();
      // act
      const command = sut.createCommandToInvokePowerShell('non-important-command');
      // assert
      expect(command.startsWith('PowerShell ')).to.equal(true);
    });
    it('includes encoded command as parameter', () => {
      // arrange
      const expectedParameterName = '-EncodedCommand';
      const sut = new EncodedPowerShellInvokeCmdCommandCreator();
      // act
      const command = sut.createCommandToInvokePowerShell('non-important-command');
      // assert
      const args = parsePowerShellArgs(command);
      const parameterNames = [...args.keys()];
      expect(parameterNames).to.include(expectedParameterName);
    });
    it('correctly encode the command as utf16le base64', () => {
      // arrange
      const givenCode = 'Write-Output "Today is $(Get-Date -Format \'dddd, MMMM dd\')."';
      const expectedEncodedCommand = 'VwByAGkAdABlAC0ATwB1AHQAcAB1AHQAIAAiAFQAbwBkAGEAeQAgAGkAcwAgACQAKABHAGUAdAAtAEQAYQB0AGUAIAAtAEYAbwByAG0AYQB0ACAAJwBkAGQAZABkACwAIABNAE0ATQBNACAAZABkACcAKQAuACIA';
      const sut = new EncodedPowerShellInvokeCmdCommandCreator();
      // act
      const command = sut.createCommandToInvokePowerShell(givenCode);
      // assert
      const args = parsePowerShellArgs(command);
      const actualEncodedCommand = args.get('-EncodedCommand');
      expect(actualEncodedCommand).to.equal(expectedEncodedCommand);
    });
  });
});

function parsePowerShellArgs(command: string): Map<string, string | undefined> {
  const argsMap = new Map<string, string | undefined>();
  const argRegex = /(-\w+)(\s+([^ ]+))?/g;
  let match = argRegex.exec(command);
  while (match !== null) {
    const arg = match[1];
    const value = match[3];
    argsMap.set(arg, value);
    match = argRegex.exec(command);
  }
  return argsMap;
}
