import { describe } from 'vitest';
import { BatchFileSyntax } from '@/application/Parser/Executable/Script/Validation/Analyzers/Syntax/BatchFileSyntax';
import { runLanguageSyntaxTests } from './LanguageSyntaxTestRunner';

describe('BatchFileSyntax', () => {
  runLanguageSyntaxTests(
    () => new BatchFileSyntax(),
  );
});
