import { describe } from 'vitest';
import { ScriptingLanguage } from '@/domain/ScriptingLanguage';
import { ShellBuilder } from '@/application/Context/State/Code/Generation/Languages/ShellBuilder';
import { BatchBuilder } from '@/application/Context/State/Code/Generation/Languages/BatchBuilder';
import { CodeBuilderFactory } from '@/application/Context/State/Code/Generation/CodeBuilderFactory';
import { ScriptingLanguageFactoryTestRunner } from '@tests/unit/application/Common/ScriptingLanguage/ScriptingLanguageFactoryTestRunner';

describe('CodeBuilderFactory', () => {
  const sut = new CodeBuilderFactory();
  const runner = new ScriptingLanguageFactoryTestRunner()
    .expectInstance(ScriptingLanguage.shellscript, ShellBuilder)
    .expectInstance(ScriptingLanguage.batchfile, BatchBuilder);
  runner.testCreateMethod(sut);
});
