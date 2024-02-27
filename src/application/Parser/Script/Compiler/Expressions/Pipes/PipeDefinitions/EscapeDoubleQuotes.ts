import type { IPipe } from '../IPipe';

export class EscapeDoubleQuotes implements IPipe {
  public readonly name: string = 'escapeDoubleQuotes';

  public apply(raw: string): string {
    if (!raw) {
      return raw;
    }
    return raw.replaceAll('"', '"^""');
    /* eslint-disable vue/max-len */
    /*
      "^"" is the most robust and stable choice.
      Other options:
        ""
          Breaks, because it is fundamentally unsupported
        """"
          Does not work with consecutive double quotes.
          E.g. `PowerShell -Command "$name='aq'; Write-Host """"Disabled `""""$name`"""""""";"`
          Works when using: `PowerShell -Command "$name='aq'; Write-Host "^""Disabled `"^""$name`"^"" "^"";"`
        \"
          May break as they are interpreted by cmd.exe as metacharacters breaking the command
          E.g. `PowerShell -Command "Write-Host 'Hello \"w&orld\"'"` does not work due to unescaped "&"
          Works when using: `PowerShell -Command "Write-Host 'Hello "^""w&orld"^""'"`
        \""
          Normalizes interior whitespace
          E.g. `PowerShell -Command "\""a&  c\"".length"`, outputs 4 and discards one of two whitespaces
          Works when using "^"": `PowerShell -Command ""^""a&  c"^"".length"`
      A good explanation: https://stackoverflow.com/a/31413730
    */
    /* eslint-enable vue/max-len */
  }
}
