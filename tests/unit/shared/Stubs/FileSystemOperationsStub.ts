import type { FileSystemOperations } from '@/infrastructure/FileSystem/FileSystemOperations';
import { StubWithObservableMethodCalls } from './StubWithObservableMethodCalls';

export class FileSystemOperationsStub
  extends StubWithObservableMethodCalls<FileSystemOperations>
  implements FileSystemOperations {
  private readonly writtenFiles: Map<string, string> = new Map();

  private readonly fileAvailability: Map<string, boolean> = new Map();

  private directoryContents: Map<string, string[]> = new Map();

  private userDataDirectory = `/${FileSystemOperationsStub.name}-user-data-dir/`;

  private combinePathSequence = new Array<string>();

  private combinePathScenarios = new Map<string, string>();

  private combinePathDefaultSeparator = `/[${FileSystemOperationsStub.name}]PATH-SEGMENT-SEPARATOR/`;

  public setFilePermissions(filePath: string, mode: string | number): Promise<void> {
    this.registerMethodCall({
      methodName: 'setFilePermissions',
      args: [filePath, mode],
    });
    return Promise.resolve();
  }

  public writeFile = (filePath: string, fileContents: string, encoding: NodeJS.BufferEncoding) => {
    this.registerMethodCall({
      methodName: 'writeFile',
      args: [filePath, fileContents, encoding],
    });
    this.writtenFiles.set(filePath, fileContents);
    return Promise.resolve();
  };

  public readFile = (filePath: string, encoding: NodeJS.BufferEncoding) => {
    this.registerMethodCall({
      methodName: 'readFile',
      args: [filePath, encoding],
    });
    const fileContents = this.writtenFiles.get(filePath);
    return Promise.resolve(fileContents ?? `[${FileSystemOperationsStub.name}] file-contents`);
  };

  public createDirectory(directoryPath: string, isRecursive?: boolean): Promise<void> {
    this.registerMethodCall({
      methodName: 'createDirectory',
      args: [directoryPath, isRecursive],
    });
    return Promise.resolve();
  }

  public isFileAvailable(filePath: string): Promise<boolean> {
    this.registerMethodCall({
      methodName: 'isFileAvailable',
      args: [filePath],
    });
    const availability = this.fileAvailability.get(filePath);
    if (availability !== undefined) {
      return Promise.resolve(availability);
    }
    const fileContents = this.writtenFiles.get(filePath);
    if (fileContents !== undefined) {
      return Promise.resolve(true);
    }
    return Promise.resolve(true);
  }

  public isDirectoryAvailable(directoryPath: string): Promise<boolean> {
    this.registerMethodCall({
      methodName: 'isDirectoryAvailable',
      args: [directoryPath],
    });
    return Promise.resolve(true);
  }

  public deletePath(filePath: string): Promise<void> {
    this.registerMethodCall({
      methodName: 'deletePath',
      args: [filePath],
    });
    return Promise.resolve();
  }

  public withUserDirectoryResult(directory: string): this {
    this.userDataDirectory = directory;
    return this;
  }

  public getUserDataDirectory(): string {
    this.registerMethodCall({
      methodName: 'getUserDataDirectory',
      args: [],
    });
    return this.userDataDirectory;
  }

  public listDirectoryContents(directoryPath: string): Promise<string[]> {
    this.registerMethodCall({
      methodName: 'listDirectoryContents',
      args: [directoryPath],
    });
    const contents = this.directoryContents.get(directoryPath);
    return Promise.resolve(contents ?? []);
  }

  public withDirectoryContents(
    directoryPath: string,
    fileOrFolderNames: readonly string[],
  ): this {
    this.directoryContents.set(directoryPath, [...fileOrFolderNames]);
    return this;
  }

  public withFileAvailability(
    filePath: string,
    isAvailable: boolean,
  ): this {
    this.fileAvailability.set(filePath, isAvailable);
    return this;
  }

  public withJoinResult(returnValue: string, ...paths: string[]): this {
    this.combinePathScenarios.set(getCombinePathsScenarioKey(paths), returnValue);
    return this;
  }

  public withJoinResultSequence(...valuesToReturn: string[]): this {
    this.combinePathSequence.push(...valuesToReturn);
    this.combinePathSequence.reverse();
    return this;
  }

  public withDefaultSeparator(defaultSeparator: string): this {
    this.combinePathDefaultSeparator = defaultSeparator;
    return this;
  }

  public combinePaths(...pathSegments: string[]): string {
    this.registerMethodCall({
      methodName: 'combinePaths',
      args: pathSegments,
    });
    const nextInSequence = this.combinePathSequence.pop();
    if (nextInSequence) {
      return nextInSequence;
    }
    const key = getCombinePathsScenarioKey(pathSegments);
    const foundScenario = this.combinePathScenarios.get(key);
    if (foundScenario) {
      return foundScenario;
    }
    return pathSegments.join(this.combinePathDefaultSeparator);
  }
}

function getCombinePathsScenarioKey(paths: string[]): string {
  return paths.join('|');
}
