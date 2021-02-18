import { Environment } from '@/application/Environment/Environment';
import os from 'os';
import path from 'path';
import fs from 'fs';
import child_process from 'child_process';
import { OperatingSystem } from '@/domain/OperatingSystem';

export async function runCodeAsync(
    code: string, folderName: string, fileExtension: string,
    node = getNodeJs(), environment = Environment.CurrentEnvironment): Promise<void> {
    const dir = node.path.join(node.os.tmpdir(), folderName);
    await node.fs.promises.mkdir(dir, {recursive: true});
    const filePath = node.path.join(dir, `run.${fileExtension}`);
    await node.fs.promises.writeFile(filePath, code);
    await node.fs.promises.chmod(filePath, '755');
    const command = getExecuteCommand(filePath, environment);
    node.child_process.exec(command);
}

function getExecuteCommand(scriptPath: string, environment: Environment): string {
    switch (environment.os) {
        case OperatingSystem.macOS:
            return `open -a Terminal.app ${scriptPath}`;
            // Another option with graphical sudo would be
            //  `osascript -e "do shell script \\"${scriptPath}\\" with administrator privileges"`
            // However it runs in background
        case OperatingSystem.Windows:
            return scriptPath;
        default:
            throw Error('undefined os');
    }
}

function getNodeJs(): INodeJs {
    return { os, path, fs, child_process };
}

export interface INodeJs {
    os: INodeOs;
    path: INodePath;
    fs: INodeFs;
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
