import { IPipe } from '../IPipe';

export class InlinePowerShell implements IPipe {
    public readonly name: string = 'inlinePowerShell';
    public apply(raw: string): string {
        return raw
            ?.split(/\r\n|\r|\n/)
            .map((line) => line.trim())
            .filter((line) => line.length > 0)
            .join('; ');
    }
}
