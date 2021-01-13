import { ILanguageSyntax } from '@/domain/ScriptCode';

export class BatchFileSyntax implements ILanguageSyntax {
    public readonly commentDelimiters = [ 'REM', '::' ];
    public readonly commonCodeParts = [ '(', ')', 'else' ];
}
