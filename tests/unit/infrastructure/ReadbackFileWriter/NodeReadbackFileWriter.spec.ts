import { constants } from 'node:fs';
import { describe, it, expect } from 'vitest';
import { Logger } from '@/application/Common/Log/Logger';
import { LoggerStub } from '@tests/unit/shared/Stubs/LoggerStub';
import { FunctionKeys } from '@/TypeHelpers';
import { sequenceEqual } from '@/application/Common/Array';
import { FileWriteErrorType } from '@/infrastructure/ReadbackFileWriter/ReadbackFileWriter';
import { expectExists } from '@tests/shared/Assertions/ExpectExists';
import { FileReadWriteOperations, NodeReadbackFileWriter } from '@/infrastructure/ReadbackFileWriter/NodeReadbackFileWriter';
import { FileReadWriteOperationsStub } from './FileReadWriteOperationsStub';

describe('NodeReadbackFileWriter', () => {
  describe('writeAndVerifyFile', () => {
    describe('successful write and verify operations', () => {
      it('confirms successful operation', async () => {
        // arrange
        const context = new NodeReadbackFileWriterTestSetup();

        // act
        const { success } = await context.writeAndVerifyFile();

        // assert
        expect(success).to.equal(true);
      });
      describe('file write operations', () => {
        it('writes to specified path', async () => {
          // arrange
          const expectedFilePath = 'test.txt';
          const fileSystemStub = new FileReadWriteOperationsStub();
          const context = new NodeReadbackFileWriterTestSetup()
            .withFilePath(expectedFilePath)
            .withFileSystem(fileSystemStub);

          // act
          await context.writeAndVerifyFile();

          // assert
          const fileWriteCalls = fileSystemStub.callHistory.filter((c) => c.methodName === 'writeFile');
          expect(fileWriteCalls).to.have.lengthOf(1);
          const [actualFilePath] = fileWriteCalls[0].args;
          expect(actualFilePath).to.equal(expectedFilePath);
        });
        it('writes specified contents', async () => {
          // arrange
          const expectedFileContents = 'expected file contents';
          const fileSystemStub = new FileReadWriteOperationsStub();
          const context = new NodeReadbackFileWriterTestSetup()
            .withFileSystem(fileSystemStub)
            .withFileContents(expectedFileContents);

          // act
          await context.writeAndVerifyFile();

          // assert
          const fileWriteCalls = fileSystemStub.callHistory.filter((c) => c.methodName === 'writeFile');
          expect(fileWriteCalls).to.have.lengthOf(1);
          const [,actualFileContents] = fileWriteCalls[0].args;
          expect(actualFileContents).to.equal(expectedFileContents);
        });
        it('uses correct encoding', async () => {
          // arrange
          const expectedEncoding: NodeJS.BufferEncoding = 'utf-8';
          const fileSystemStub = new FileReadWriteOperationsStub();
          const context = new NodeReadbackFileWriterTestSetup()
            .withFileSystem(fileSystemStub);

          // act
          await context.writeAndVerifyFile();

          // assert
          const fileWriteCalls = fileSystemStub.callHistory.filter((c) => c.methodName === 'writeFile');
          expect(fileWriteCalls).to.have.lengthOf(1);
          const [,,actualEncoding] = fileWriteCalls[0].args;
          expect(actualEncoding).to.equal(expectedEncoding);
        });
      });
      describe('existence verification', () => {
        it('checks correct path', async () => {
          // arrange
          const expectedFilePath = 'test-file-path';
          const fileSystemStub = new FileReadWriteOperationsStub();
          const context = new NodeReadbackFileWriterTestSetup()
            .withFileSystem(fileSystemStub)
            .withFilePath(expectedFilePath);

          // act
          await context.writeAndVerifyFile();

          // assert
          const accessCalls = fileSystemStub.callHistory.filter((c) => c.methodName === 'access');
          expect(accessCalls).to.have.lengthOf(1);
          const [actualFilePath] = accessCalls[0].args;
          expect(actualFilePath).to.equal(expectedFilePath);
        });
        it('uses correct mode', async () => {
          // arrange
          const expectedMode = constants.F_OK;
          const fileSystemStub = new FileReadWriteOperationsStub();
          const context = new NodeReadbackFileWriterTestSetup()
            .withFileSystem(fileSystemStub);

          // act
          await context.writeAndVerifyFile();

          // assert
          const accessCalls = fileSystemStub.callHistory.filter((c) => c.methodName === 'access');
          expect(accessCalls).to.have.lengthOf(1);
          const [,actualMode] = accessCalls[0].args;
          expect(actualMode).to.equal(expectedMode);
        });
      });
      describe('content verification', () => {
        it('reads from correct path', async () => {
          // arrange
          const expectedFilePath = 'expected-file-path.txt';
          const fileSystemStub = new FileReadWriteOperationsStub();
          const context = new NodeReadbackFileWriterTestSetup()
            .withFileSystem(fileSystemStub)
            .withFilePath(expectedFilePath);

          // act
          await context.writeAndVerifyFile();

          // assert
          const fileReadCalls = fileSystemStub.callHistory.filter((c) => c.methodName === 'readFile');
          expect(fileReadCalls).to.have.lengthOf(1);
          const [actualFilePath] = fileReadCalls[0].args;
          expect(actualFilePath).to.equal(expectedFilePath);
        });
        it('uses correct encoding', async () => {
          // arrange
          const expectedEncoding: NodeJS.BufferEncoding = 'utf-8';
          const fileSystemStub = new FileReadWriteOperationsStub();
          const context = new NodeReadbackFileWriterTestSetup()
            .withFileSystem(fileSystemStub);

          // act
          await context.writeAndVerifyFile();

          // assert
          const fileReadCalls = fileSystemStub.callHistory.filter((c) => c.methodName === 'readFile');
          expect(fileReadCalls).to.have.lengthOf(1);
          const [,actualEncoding] = fileReadCalls[0].args;
          expect(actualEncoding).to.equal(expectedEncoding);
        });
      });
      it('executes file system operations in correct sequence', async () => {
        // arrange
        const expectedOrder: ReadonlyArray<FunctionKeys<FileReadWriteOperations>> = [
          'writeFile',
          'access',
          'readFile',
        ];
        const fileSystemStub = new FileReadWriteOperationsStub();
        const context = new NodeReadbackFileWriterTestSetup()
          .withFileSystem(fileSystemStub);

        // act
        await context.writeAndVerifyFile();

        // assert
        const actualOrder = fileSystemStub.callHistory.map((c) => c.methodName);
        expect(sequenceEqual(expectedOrder, actualOrder)).to.equal(true);
      });
    });
    describe('error handling', () => {
      const testScenarios: ReadonlyArray<{
        readonly description: string;
        readonly expectedErrorType: FileWriteErrorType;
        readonly expectedErrorMessage: string;
        buildFaultyContext(
          setup: NodeReadbackFileWriterTestSetup,
          errorMessage: string,
        ): NodeReadbackFileWriterTestSetup;
      }> = [
        {
          description: 'writing failure',
          expectedErrorType: 'WriteOperationFailed',
          expectedErrorMessage: 'Error when writing file',
          buildFaultyContext: (setup, errorMessage) => {
            const fileSystemStub = new FileReadWriteOperationsStub();
            fileSystemStub.writeFile = () => Promise.reject(errorMessage);
            return setup
              .withFileSystem(fileSystemStub);
          },
        },
        {
          description: 'existence verification error',
          expectedErrorType: 'FileExistenceVerificationFailed',
          expectedErrorMessage: 'Access denied',
          buildFaultyContext: (setup, errorMessage) => {
            const fileSystemStub = new FileReadWriteOperationsStub();
            fileSystemStub.access = () => Promise.reject(errorMessage);
            return setup
              .withFileSystem(fileSystemStub);
          },
        },
        {
          description: 'reading failure',
          expectedErrorType: 'ReadVerificationFailed',
          expectedErrorMessage: 'Read error',
          buildFaultyContext: (setup, errorMessage) => {
            const fileSystemStub = new FileReadWriteOperationsStub();
            fileSystemStub.readFile = () => Promise.reject(errorMessage);
            return setup
              .withFileSystem(fileSystemStub);
          },
        },
        {
          description: 'content match failure',
          expectedErrorType: 'ContentVerificationFailed',
          expectedErrorMessage: 'The contents of the written file do not match the expected contents.',
          buildFaultyContext: (setup) => {
            const fileSystemStub = new FileReadWriteOperationsStub();
            fileSystemStub.readFile = () => Promise.resolve('different contents');
            return setup
              .withFileSystem(fileSystemStub);
          },
        },
      ];
      testScenarios.forEach(({
        description, expectedErrorType, expectedErrorMessage, buildFaultyContext,
      }) => {
        it(`handles error - ${description}`, async () => {
          // arrange
          const context = buildFaultyContext(
            new NodeReadbackFileWriterTestSetup(),
            expectedErrorMessage,
          );

          // act
          const { success, error } = await context.writeAndVerifyFile();

          // assert
          expect(success).to.equal(false);
          expectExists(error);
          expect(error.message).to.include(expectedErrorMessage);
          expect(error.type).to.equal(expectedErrorType);
        });
        it(`logs error - ${description}`, async () => {
          // arrange
          const loggerStub = new LoggerStub();
          const context = buildFaultyContext(
            new NodeReadbackFileWriterTestSetup()
              .withLogger(loggerStub),
            expectedErrorMessage,
          );

          // act
          await context.writeAndVerifyFile();

          // assert
          loggerStub.assertLogsContainMessagePart('error', expectedErrorMessage);
        });
      });
    });
  });
});

class NodeReadbackFileWriterTestSetup {
  private logger: Logger = new LoggerStub();

  private fileSystem: FileReadWriteOperations = new FileReadWriteOperationsStub();

  private filePath = '/test/file/path.txt';

  private fileContents = 'test file contents';

  public withLogger(logger: Logger): this {
    this.logger = logger;
    return this;
  }

  public withFileSystem(fileSystem: FileReadWriteOperations): this {
    this.fileSystem = fileSystem;
    return this;
  }

  public withFilePath(filePath: string): this {
    this.filePath = filePath;
    return this;
  }

  public withFileContents(fileContents: string): this {
    this.fileContents = fileContents;
    return this;
  }

  public writeAndVerifyFile(): ReturnType<NodeReadbackFileWriter['writeAndVerifyFile']> {
    const writer = new NodeReadbackFileWriter(
      this.logger,
      this.fileSystem,
    );
    return writer.writeAndVerifyFile(
      this.filePath,
      this.fileContents,
    );
  }
}
