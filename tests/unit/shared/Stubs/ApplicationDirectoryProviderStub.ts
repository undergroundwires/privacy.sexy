import type {
  DirectoryCreationOutcome,
  ApplicationDirectoryProvider,
  DirectoryType,
  DirectoryCreationError,
} from '@/infrastructure/FileSystem/Directory/ApplicationDirectoryProvider';

export class ApplicationDirectoryProviderStub implements ApplicationDirectoryProvider {
  private directoryPaths: Record<DirectoryType, string> = {
    'update-installation-files': `[${ApplicationDirectoryProviderStub.name}]update installation files directory`,
    'script-runs': `[${ApplicationDirectoryProviderStub.name}]scripts directory`,
  };

  private failure: DirectoryCreationError | undefined = undefined;

  public withDirectoryPath(type: DirectoryType, directoryPath: string): this {
    this.directoryPaths[type] = directoryPath;
    return this;
  }

  public provideDirectory(type: DirectoryType): Promise<DirectoryCreationOutcome> {
    if (this.failure) {
      return Promise.resolve({
        success: false,
        error: this.failure,
      });
    }
    return Promise.resolve({
      success: true,
      directoryAbsolutePath: this.directoryPaths[type],
    });
  }

  public withFailure(error?: DirectoryCreationError): this {
    this.failure = error ?? {
      type: 'DirectoryWriteError',
      message: `[${ApplicationDirectoryProviderStub.name}]injected failure`,
    };
    return this;
  }
}
