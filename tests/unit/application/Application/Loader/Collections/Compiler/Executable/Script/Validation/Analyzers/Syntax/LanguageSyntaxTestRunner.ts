import { describe, it, expect } from 'vitest';
import type { LanguageSyntax } from '@/application/Application/Loader/Collections/Compiler/Executable/Script/Validation/Analyzers/Syntax/LanguageSyntax';

export function runLanguageSyntaxTests(createSyntax: () => LanguageSyntax) {
  describe('commentDelimiters', () => {
    it('returns defined value', () => {
      // arrange
      const sut = createSyntax();
      // act
      const value = sut.commentDelimiters;
      // assert
      expect(value);
    });
  });
  describe('commonCodeParts', () => {
    it('returns defined value', () => {
      // arrange
      const sut = createSyntax();
      // act
      const value = sut.commonCodeParts;
      // assert
      expect(value);
    });
  });
}
