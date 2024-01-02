import { FilenameGenerator } from '@/infrastructure/CodeRunner/Filename/FilenameGenerator';

export class FilenameGeneratorStub implements FilenameGenerator {
  private filename = `[${FilenameGeneratorStub.name}]file-name-stub`;

  public generateFilename(): string {
    return this.filename;
  }

  public withFilename(filename: string): this {
    this.filename = filename;
    return this;
  }
}
