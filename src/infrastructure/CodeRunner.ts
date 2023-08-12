import os from 'os';
import path from 'path';
import fs from 'fs';
// eslint-disable-next-line camelcase
import child_process from 'child_process';
import { Environment } from '@/application/Environment/Environment';
import { OperatingSystem } from '@/domain/OperatingSystem';

export class CodeRunner {
  constructor(
    private readonly node = getNodeJs(),
    private readonly environment = Environment.CurrentEnvironment,
  ) {
  }

  public async runCode(code: string, folderName: string, fileExtension: string): Promise<void> {
    const dir = this.node.path.join(this.node.os.tmpdir(), folderName);
    await this.node.fs.promises.mkdir(dir, { recursive: true });
    const filePath = this.node.path.join(dir, `run.${fileExtension}`);
    await this.node.fs.promises.writeFile(filePath, code);
    await this.node.fs.promises.chmod(filePath, '755');
    const command = getExecuteCommand(filePath, this.environment);
    this.node.child_process.exec(command);
  }
}

function getExecuteCommand(scriptPath: string, environment: Environment): string {
  switch (environment.os) {
    case OperatingSystem.Linux:
      return `x-terminal-emulator -e '${scriptPath}'`;
    case OperatingSystem.macOS:
      return `open -a Terminal.app ${scriptPath}`;
    // Another option with graphical sudo would be
    //  `osascript -e "do shell script \\"${scriptPath}\\" with administrator privileges"`
    // However it runs in background
    case OperatingSystem.Windows:
      return scriptPath;
    default:
      throw Error(`unsupported os: ${OperatingSystem[environment.os]}`);
  }
}

function getNodeJs(): INodeJs {
  return {
    os, path, fs, child_process,
  };
}

export interface INodeJs {
  os: INodeOs;
  path: INodePath;
  fs: INodeFs;
  // eslint-disable-next-line camelcase
  child_process: INodeChildProcess;
}

export interface INodeOs {
  tmpdir(): string;
}

export interface INodePath {
  join(...paths: string[]): string;
}

export interface INodeChildProcess {
  exec(command: string): void;
}

export interface INodeFs {
  readonly promises: INodeFsPromises;
}

interface INodeFsPromisesMakeDirectoryOptions {
  recursive?: boolean;
}

interface INodeFsPromises { // https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/node/v13/fs.d.ts
  chmod(path: string, mode: string | number): Promise<void>;
  mkdir(path: string, options: INodeFsPromisesMakeDirectoryOptions): Promise<string>;
  writeFile(path: string, data: string): Promise<void>;
}
