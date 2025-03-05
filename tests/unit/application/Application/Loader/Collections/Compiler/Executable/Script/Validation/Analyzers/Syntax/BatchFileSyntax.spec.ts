import { describe } from 'vitest';
import { BatchFileSyntax } from '@/application/Application/Loader/Collections/Compiler/Executable/Script/Validation/Analyzers/Syntax/BatchFileSyntax';
import { runLanguageSyntaxTests } from './LanguageSyntaxTestRunner';

describe('BatchFileSyntax', () => {
  runLanguageSyntaxTests(
    () => new BatchFileSyntax(),
  );
});
