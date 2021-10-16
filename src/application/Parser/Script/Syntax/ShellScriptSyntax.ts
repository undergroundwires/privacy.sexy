import { ILanguageSyntax } from '@/domain/ScriptCode';

export class ShellScriptSyntax implements ILanguageSyntax {
    public readonly commentDelimiters = [ '#' ];
    public readonly commonCodeParts = [ '(', ')', 'else', 'fi' ];
}
