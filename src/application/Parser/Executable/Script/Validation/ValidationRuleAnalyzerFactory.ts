import { CodeValidationRule } from './CodeValidationRule';
import { analyzeDuplicateLines } from './Analyzers/AnalyzeDuplicateLines';
import { analyzeEmptyLines } from './Analyzers/AnalyzeEmptyLines';
import { analyzeTooLongLines } from './Analyzers/AnalyzeTooLongLines';
import { analyzeCommentOnlyCode } from './Analyzers/AnalyzeCommentOnlyCode';
import type { CodeValidationAnalyzer } from './Analyzers/CodeValidationAnalyzer';

export interface ValidationRuleAnalyzerFactory {
  (
    rules: readonly CodeValidationRule[],
  ): CodeValidationAnalyzer[];
}

export const createValidationAnalyzers: ValidationRuleAnalyzerFactory = (
  rules,
): CodeValidationAnalyzer[] => {
  if (rules.length === 0) { throw new Error('missing rules'); }
  validateUniqueRules(rules);
  return rules.map((rule) => createValidationRule(rule));
};

function createValidationRule(rule: CodeValidationRule): CodeValidationAnalyzer {
  switch (rule) {
    case CodeValidationRule.NoEmptyLines:
      return analyzeEmptyLines;
    case CodeValidationRule.NoDuplicatedLines:
      return analyzeDuplicateLines;
    case CodeValidationRule.NoTooLongLines:
      return analyzeTooLongLines;
    case CodeValidationRule.NoCommentOnlyLines:
      return analyzeCommentOnlyCode;
    default:
      throw new Error(`Unknown rule: ${rule}`);
  }
}

function validateUniqueRules(
  rules: readonly CodeValidationRule[],
): void {
  const ruleCounts = new Map<CodeValidationRule, number>();
  rules.forEach((rule) => {
    ruleCounts.set(rule, (ruleCounts.get(rule) || 0) + 1);
  });
  const duplicates = Array.from(ruleCounts.entries())
    .filter(([, count]) => count > 1)
    .map(([rule, count]) => `${CodeValidationRule[rule]} (${count} times)`);
  if (duplicates.length > 0) {
    throw new Error(`Duplicate rules are not allowed. Duplicates found: ${duplicates.join(', ')}`);
  }
}
