import { describe, it } from 'vitest';
import { analyzeCommentOnlyCode, type CommentOnlyCodeAnalyzer } from '@/application/Application/Loader/Collections/Compiler/Executable/Script/Validation/Analyzers/AnalyzeCommentOnlyCode';
import type { CommentLineChecker } from '@/application/Application/Loader/Collections/Compiler/Executable/Script/Validation/Analyzers/Common/CommentLineChecker';
import type { SyntaxFactory } from '@/application/Application/Loader/Collections/Compiler/Executable/Script/Validation/Analyzers/Syntax/SyntaxFactory';
import { ScriptLanguage } from '@/domain/ScriptMetadata/ScriptLanguage';
import type { CodeLine, InvalidCodeLine } from '@/application/Application/Loader/Collections/Compiler/Executable/Script/Validation/Analyzers/CodeValidationAnalyzer';
import { CommentLineCheckerStub } from '@tests/unit/shared/Stubs/CommentLineCheckerStub';
import { SyntaxFactoryStub } from '@tests/unit/shared/Stubs/SyntaxFactoryStub';
import { LanguageSyntaxStub } from '@tests/unit/shared/Stubs/LanguageSyntaxStub';
import { createCodeLines } from './CreateCodeLines';
import { expectSameInvalidCodeLines } from './ExpectSameInvalidCodeLines';

describe('AnalyzeCommentOnlyCode', () => {
  describe('analyzeCommentOnlyCode', () => {
    it('returns empty given no match', () => {
      // arrange
      const context = setupScenario({
        givenLines: ['line-1', 'line-2', 'line-3'],
        matchedLines: [],
      });
      // act
      const actualResult = context.analyze();
      // assert
      expect(actualResult).to.have.lengthOf(0);
    });
    it('returns empty given some matches', () => {
      // arrange
      const context = setupScenario({
        givenLines: ['line-1', 'line-2'],
        matchedLines: [],
      });
      // act
      const actualResult = context.analyze();
      // assert
      expect(actualResult).to.have.lengthOf(0);
    });
    it('returns all lines given all match', () => {
      // arrange
      const lines = ['line-1', 'line-2', 'line-3'];
      const expectedResult: InvalidCodeLine[] = lines
        .map((_line, index): InvalidCodeLine => ({
          lineNumber: index + 1,
          error: 'Code consists of comments only',
        }));
      const context = setupScenario({
        givenLines: lines,
        matchedLines: lines,
      });
      // act
      const actualResult = context.analyze();
      // assert
      expectSameInvalidCodeLines(expectedResult, actualResult);
    });
    it('uses correct language for syntax creation', () => {
      // arrange
      const expectedLanguage = ScriptLanguage.batchfile;
      let actualLanguage: ScriptLanguage | undefined;
      const factory: SyntaxFactory = (language) => {
        actualLanguage = language;
        return new LanguageSyntaxStub();
      };
      const context = new TestContext()
        .withLanguage(expectedLanguage)
        .withSyntaxFactory(factory);
      // act
      context.analyze();
      // assert
      expect(actualLanguage).to.equal(expectedLanguage);
    });
  });
});

interface CommentOnlyCodeAnalysisTestScenario {
  readonly givenLines: readonly string[];
  readonly matchedLines: readonly string[];
}

function setupScenario(
  scenario: CommentOnlyCodeAnalysisTestScenario,
): TestContext {
  // arrange
  const lines = scenario.givenLines;
  const syntax = new LanguageSyntaxStub();
  const checker = new CommentLineCheckerStub();
  scenario.matchedLines.forEach((line) => checker.withPredeterminedResult({
    givenLine: line,
    givenSyntax: syntax,
    result: true,
  }));
  return new TestContext()
    .withSyntaxFactory(() => syntax)
    .withLines(lines)
    .withCommentLineChecker(checker.get());
}

export class TestContext {
  private codeLines: readonly CodeLine[] = createCodeLines(['test-code-line']);

  private language = ScriptLanguage.batchfile;

  private syntaxFactory: SyntaxFactory = new SyntaxFactoryStub().get();

  private commentLineChecker: CommentLineChecker = new CommentLineCheckerStub().get();

  public withLines(lines: readonly string[]): this {
    this.codeLines = createCodeLines(lines);
    return this;
  }

  public withLanguage(language: ScriptLanguage): this {
    this.language = language;
    return this;
  }

  public withSyntaxFactory(syntaxFactory: SyntaxFactory): this {
    this.syntaxFactory = syntaxFactory;
    return this;
  }

  public withCommentLineChecker(commentLineChecker: CommentLineChecker): this {
    this.commentLineChecker = commentLineChecker;
    return this;
  }

  public analyze(): ReturnType<CommentOnlyCodeAnalyzer> {
    return analyzeCommentOnlyCode(
      this.codeLines,
      this.language,
      this.syntaxFactory,
      this.commentLineChecker,
    );
  }
}
