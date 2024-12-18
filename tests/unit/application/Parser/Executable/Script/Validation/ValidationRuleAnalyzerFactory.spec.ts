import { describe, it, expect } from 'vitest';
import { CodeValidationRule } from '@/application/Parser/Executable/Script/Validation/CodeValidationRule';
import { analyzeEmptyLines } from '@/application/Parser/Executable/Script/Validation/Analyzers/AnalyzeEmptyLines';
import { analyzeDuplicateLines } from '@/application/Parser/Executable/Script/Validation/Analyzers/AnalyzeDuplicateLines';
import { analyzeTooLongLines } from '@/application/Parser/Executable/Script/Validation/Analyzers/AnalyzeTooLongLines';
import { createValidationAnalyzers } from '@/application/Parser/Executable/Script/Validation/ValidationRuleAnalyzerFactory';
import type { CodeValidationAnalyzer } from '@/application/Parser/Executable/Script/Validation/Analyzers/CodeValidationAnalyzer';
import { formatAssertionMessage } from '@tests/shared/FormatAssertionMessage';
import { analyzeCommentOnlyCode } from '@/application/Parser/Executable/Script/Validation/Analyzers/AnalyzeCommentOnlyCode';

describe('ValidationRuleAnalyzerFactory', () => {
  describe('createValidationAnalyzers', () => {
    it('throws error when no rules are provided', () => {
      // arrange
      const expectedErrorMessage = 'missing rules';
      const rules: readonly CodeValidationRule[] = [];
      const context = new TestContext()
        .withRules(rules);
      // act
      const act = () => context.create();
      // assert
      expect(act).to.throw(expectedErrorMessage);
    });

    it('creates correct analyzers for all valid rules', () => {
      // arrange
      const expectedAnalyzersForRules: Record<CodeValidationRule, CodeValidationAnalyzer> = {
        [CodeValidationRule.NoEmptyLines]: analyzeEmptyLines,
        [CodeValidationRule.NoDuplicatedLines]: analyzeDuplicateLines,
        [CodeValidationRule.NoTooLongLines]: analyzeTooLongLines,
        [CodeValidationRule.NoCommentOnlyLines]: analyzeCommentOnlyCode,
      };
      const givenRules: CodeValidationRule[] = Object
        .keys(expectedAnalyzersForRules)
        .map((r) => Number(r) as CodeValidationRule);
      const context = new TestContext()
        .withRules(givenRules);
      // act
      const actualAnalyzers = context.create();
      // assert
      expect(actualAnalyzers).to.have.lengthOf(Object.entries(expectedAnalyzersForRules).length);
      const expectedAnalyzers = Object.values(expectedAnalyzersForRules);
      expect(actualAnalyzers).to.deep.equal(expectedAnalyzers);
    });

    it('throws error for unknown rule', () => {
      // arrange
      const unknownRule = 9999 as CodeValidationRule;
      const expectedErrorMessage = `Unknown rule: ${unknownRule}`;
      const context = new TestContext()
        .withRules([unknownRule]);
      // arrange
      const act = () => context.create();
      // assert
      expect(act).to.throw(expectedErrorMessage);
    });

    it('throws error for duplicate rules', () => {
      // arrange
      const duplicate1 = CodeValidationRule.NoEmptyLines;
      const duplicate2 = CodeValidationRule.NoDuplicatedLines;
      const rules: CodeValidationRule[] = [
        duplicate1, duplicate1,
        duplicate2, duplicate2,
      ];
      const expectedErrorMessage: string = [
        'Duplicate rules are not allowed.',
        `Duplicates found: ${CodeValidationRule[duplicate1]} (2 times), ${CodeValidationRule[duplicate2]} (2 times)`,
      ].join(' ');
      const context = new TestContext()
        .withRules(rules);
      // act
      const act = () => context.create();
      // assert
      expect(act).to.throw(expectedErrorMessage);
    });

    it('handles single rule correctly', () => {
      // arrange
      const givenRule = CodeValidationRule.NoEmptyLines;
      const expectedAnalyzer = analyzeEmptyLines;
      const context = new TestContext()
        .withRules([givenRule]);
      // act
      const analyzers = context.create();
      // assert
      expect(analyzers).to.have.lengthOf(1);
      expect(analyzers[0]).toBe(expectedAnalyzer);
    });

    it('handles multiple unique rules correctly', () => {
      // arrange
      const expectedRuleAnalyzerPairs = new Map<CodeValidationRule, CodeValidationAnalyzer>([
        [CodeValidationRule.NoEmptyLines, analyzeEmptyLines],
        [CodeValidationRule.NoDuplicatedLines, analyzeDuplicateLines],
      ]);
      const rules = Array.from(expectedRuleAnalyzerPairs.keys());
      const context = new TestContext()
        .withRules(rules);
      // act
      const actualAnalyzers = context.create();
      // assert
      expect(actualAnalyzers).to.have.lengthOf(expectedRuleAnalyzerPairs.size);
      actualAnalyzers.forEach((analyzer, index) => {
        const rule = rules[index];
        const expectedAnalyzer = expectedRuleAnalyzerPairs.get(rule);
        expect(analyzer).to.equal(expectedAnalyzer, formatAssertionMessage([
          `Analyzer for rule ${CodeValidationRule[rule]} does not match the expected analyzer`,
        ]));
      });
    });
  });
});

class TestContext {
  private rules: readonly CodeValidationRule[] = [CodeValidationRule.NoDuplicatedLines];

  public withRules(rules: readonly CodeValidationRule[]): this {
    this.rules = rules;
    return this;
  }

  public create(): ReturnType<typeof createValidationAnalyzers> {
    return createValidationAnalyzers(this.rules);
  }
}
