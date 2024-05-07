import type { PowerShellInvokeShellCommandCreator } from './PowerShellInvokeShellCommandCreator';

/**
  Encoding PowerShell commands resolve issues with quote handling.

  There are known problems with PowerShell's handling of double quotes in command line arguments:
  - Quote stripping in PowerShell command line arguments: https://web.archive.org/web/20240507102706/https://stackoverflow.com/questions/6714165/powershell-stripping-double-quotes-from-command-line-arguments
  - privacy.sexy double quotes issue when calling PowerShell from command line: https://web.archive.org/web/20240507102841/https://github.com/undergroundwires/privacy.sexy/issues/351
  - Challenges with single quotes in PowerShell command line: https://web.archive.org/web/20240507102047/https://stackoverflow.com/questions/20958388/command-line-escaping-single-quote-for-powershell

  Using the `EncodedCommand` parameter is recommended by Microsoft for handling
  complex quoting scenarios. This approach helps avoid issues by encoding the entire
  command as a Base64 string:
  - Microsoft's documentation on using the `EncodedCommand` parameter: https://web.archive.org/web/20240507102733/https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_powershell_exe?view=powershell-5.1#-encodedcommand-base64encodedcommand
*/
export class EncodedPowerShellInvokeCmdCommandCreator
implements PowerShellInvokeShellCommandCreator {
  public createCommandToInvokePowerShell(powerShellScript: string): string {
    return generateEncodedPowershellCommand(powerShellScript);
  }
}

function generateEncodedPowershellCommand(powerShellScript: string): string {
  const encodedCommand = encodeForPowershellExecution(powerShellScript);
  return `PowerShell -EncodedCommand ${encodedCommand}`;
}

function encodeForPowershellExecution(script: string): string {
  // The string must be formatted using UTF-16LE character encoding, see: https://web.archive.org/web/20240507102733/https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_powershell_exe?view=powershell-5.1#-encodedcommand-base64encodedcommand
  const buffer = Buffer.from(script, 'utf16le');
  return buffer.toString('base64');
}
