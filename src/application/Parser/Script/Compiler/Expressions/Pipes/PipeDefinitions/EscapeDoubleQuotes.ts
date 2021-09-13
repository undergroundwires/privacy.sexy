import { IPipe } from '../IPipe';

export class EscapeDoubleQuotes implements IPipe {
    public readonly name: string = 'escapeDoubleQuotes';
    public apply(raw: string): string {
        return raw?.replaceAll('"', '\\"');
        /*
            In batch, it also works with 4 double quotes but looks bloated
            An easy test: PowerShell -Command "Write-Host '\"Hello World\"'"
        */
    }
}
