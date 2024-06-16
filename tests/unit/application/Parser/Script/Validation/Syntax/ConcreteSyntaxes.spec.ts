import { describe, it, expect } from 'vitest';
import { ShellScriptSyntax } from '@/application/Parser/Script/Validation/Syntax/ShellScriptSyntax';
import type { ILanguageSyntax } from '@/application/Parser/Script/Validation/Syntax/ILanguageSyntax';
import { BatchFileSyntax } from '@/application/Parser/Script/Validation/Syntax/BatchFileSyntax';

function getSystemsUnderTest(): ILanguageSyntax[] {
  return [new BatchFileSyntax(), new ShellScriptSyntax()];
}

describe('ConcreteSyntaxes', () => {
  describe('commentDelimiters', () => {
    for (const sut of getSystemsUnderTest()) {
      it(`${sut.constructor.name} returns defined value`, () => {
        // act
        const value = sut.commentDelimiters;
        // assert
        expect(value);
      });
    }
  });
  describe('commonCodeParts', () => {
    for (const sut of getSystemsUnderTest()) {
      it(`${sut.constructor.name} returns defined value`, () => {
        // act
        const value = sut.commonCodeParts;
        // assert
        expect(value);
      });
    }
  });
});
