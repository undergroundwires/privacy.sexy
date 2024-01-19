import { ScriptDirectoryOutcome, ScriptDirectoryProvider } from '@/infrastructure/CodeRunner/Creation/Directory/ScriptDirectoryProvider';

export class ScriptDirectoryProviderStub implements ScriptDirectoryProvider {
  private directoryPath = `[${ScriptDirectoryProviderStub.name}]scriptDirectory`;

  public withDirectoryPath(directoryPath: string): this {
    this.directoryPath = directoryPath;
    return this;
  }

  public provideScriptDirectory(): Promise<ScriptDirectoryOutcome> {
    return Promise.resolve({
      success: true,
      directoryAbsolutePath: this.directoryPath,
    });
  }
}
