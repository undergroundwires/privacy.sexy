import { FileReadWriteOperations } from '@/infrastructure/ReadbackFileWriter/NodeReadbackFileWriter';
import { StubWithObservableMethodCalls } from '@tests/unit/shared/Stubs/StubWithObservableMethodCalls';

export class FileReadWriteOperationsStub
  extends StubWithObservableMethodCalls<FileReadWriteOperations>
  implements FileReadWriteOperations {
  private readonly writtenFiles: Record<string, string> = {};

  public writeFile = (filePath: string, fileContents: string, encoding: NodeJS.BufferEncoding) => {
    this.registerMethodCall({
      methodName: 'writeFile',
      args: [filePath, fileContents, encoding],
    });
    this.writtenFiles[filePath] = fileContents;
    return Promise.resolve();
  };

  public access = (...args: Parameters<FileReadWriteOperations['access']>) => {
    this.registerMethodCall({
      methodName: 'access',
      args: [...args],
    });
    return Promise.resolve();
  };

  public readFile = (filePath: string, encoding: NodeJS.BufferEncoding) => {
    this.registerMethodCall({
      methodName: 'readFile',
      args: [filePath, encoding],
    });
    const fileContents = this.writtenFiles[filePath];
    return Promise.resolve(fileContents);
  };
}
