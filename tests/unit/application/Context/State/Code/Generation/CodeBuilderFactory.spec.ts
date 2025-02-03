import { describe } from 'vitest';
import { ScriptLanguage } from '@/domain/ScriptMetadata/ScriptLanguage';
import { ShellBuilder } from '@/application/Context/State/Code/Generation/Languages/ShellBuilder';
import { BatchBuilder } from '@/application/Context/State/Code/Generation/Languages/BatchBuilder';
import { CodeBuilderFactory } from '@/application/Context/State/Code/Generation/CodeBuilderFactory';
import { ScriptingLanguageFactoryTestRunner } from '@tests/unit/application/Common/ScriptingLanguage/ScriptingLanguageFactoryTestRunner';

describe('CodeBuilderFactory', () => {
  const sut = new CodeBuilderFactory();
  const runner = new ScriptingLanguageFactoryTestRunner()
    .expectInstance(ScriptLanguage.shellscript, ShellBuilder)
    .expectInstance(ScriptLanguage.batchfile, BatchBuilder);
  runner.testCreateMethod(sut);
});
