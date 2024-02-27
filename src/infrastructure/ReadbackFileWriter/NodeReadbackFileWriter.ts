import { writeFile, access, readFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import type { Logger } from '@/application/Common/Log/Logger';
import { ElectronLogger } from '../Log/ElectronLogger';
import type {
  FailedFileWrite, ReadbackFileWriter, FileWriteErrorType,
  FileWriteOutcome, SuccessfulFileWrite,
} from './ReadbackFileWriter';

const FILE_ENCODING: NodeJS.BufferEncoding = 'utf-8';

export class NodeReadbackFileWriter implements ReadbackFileWriter {
  constructor(
    private readonly logger: Logger = ElectronLogger,
    private readonly fileSystem: FileReadWriteOperations = {
      writeFile,
      readFile: (path, encoding) => readFile(path, encoding),
      access,
    },
  ) { }

  public async writeAndVerifyFile(
    filePath: string,
    fileContents: string,
  ): Promise<FileWriteOutcome> {
    this.logger.info(`Starting file write and verification process for: ${filePath}`);
    const fileWritePipelineActions: ReadonlyArray<() => Promise<FileWriteOutcome>> = [
      () => this.createOrOverwriteFile(filePath, fileContents),
      () => this.verifyFileExistsWithoutReading(filePath),
      () => this.verifyFileContentsByReading(filePath, fileContents),
    ];
    for (const action of fileWritePipelineActions) {
      const actionOutcome = await action(); // eslint-disable-line no-await-in-loop
      if (!actionOutcome.success) {
        return actionOutcome;
      }
    }
    return this.reportSuccess(`File successfully written and verified: ${filePath}`);
  }

  private async createOrOverwriteFile(
    filePath: string,
    fileContents: string,
  ): Promise<FileWriteOutcome> {
    try {
      this.logger.info(`Creating file at ${filePath}, size: ${fileContents.length} characters`);
      await this.fileSystem.writeFile(filePath, fileContents, FILE_ENCODING);
      return this.reportSuccess('Created file.');
    } catch (error) {
      return this.reportFailure('WriteOperationFailed', error);
    }
  }

  private async verifyFileExistsWithoutReading(
    filePath: string,
  ): Promise<FileWriteOutcome> {
    try {
      await this.fileSystem.access(filePath, constants.F_OK);
      return this.reportSuccess('Verified file existence without reading.');
    } catch (error) {
      return this.reportFailure('FileExistenceVerificationFailed', error);
    }
  }

  private async verifyFileContentsByReading(
    filePath: string,
    expectedFileContents: string,
  ): Promise<FileWriteOutcome> {
    try {
      const actualFileContents = await this.fileSystem.readFile(filePath, FILE_ENCODING);
      if (actualFileContents !== expectedFileContents) {
        return this.reportFailure(
          'ContentVerificationFailed',
          [
            'The contents of the written file do not match the expected contents.',
            'Written file contents do not match the expected file contents',
            `File path: ${filePath}`,
            `Expected total characters: ${actualFileContents.length}`,
            `Actual total characters: ${expectedFileContents.length}`,
          ].join('\n'),
        );
      }
      return this.reportSuccess('Verified file content by reading.');
    } catch (error) {
      return this.reportFailure('ReadVerificationFailed', error);
    }
  }

  private reportFailure(
    errorType: FileWriteErrorType,
    error: Error | string,
  ): FailedFileWrite {
    this.logger.error('Error saving file', errorType, error);
    return {
      success: false,
      error: {
        type: errorType,
        message: typeof error === 'string' ? error : error.message,
      },
    };
  }

  private reportSuccess(successAction: string): SuccessfulFileWrite {
    this.logger.info(`Successful file save: ${successAction}`);
    return {
      success: true,
    };
  }
}

export interface FileReadWriteOperations {
  readonly writeFile: typeof writeFile;
  readonly access: typeof access;
  readFile: (filePath: string, encoding: NodeJS.BufferEncoding) => Promise<string>;
}
