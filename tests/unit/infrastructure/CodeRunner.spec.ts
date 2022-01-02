import 'mocha';
import { expect } from 'chai';
import { EnvironmentStub } from '@tests/unit/stubs/EnvironmentStub';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { CodeRunner } from '@/infrastructure/CodeRunner';

describe('CodeRunner', () => {
  describe('runCode', () => {
    it('creates temporary directory recursively', async () => {
      // arrange
      const expectedDir = 'expected-dir';
      const folderName = 'privacy.sexy';
      const context = new TestContext();
      context.mocks.os.setupTmpdir('tmp');
      context.mocks.path.setupJoin(expectedDir, 'tmp', folderName);

      // act
      await context
        .withFolderName(folderName)
        .runCode();

      // assert
      expect(context.mocks.fs.mkdirHistory.length).to.equal(1);
      expect(context.mocks.fs.mkdirHistory[0].isRecursive).to.equal(true);
      expect(context.mocks.fs.mkdirHistory[0].path).to.equal(expectedDir);
    });
    it('creates a file with expected code and path', async () => {
      // arrange
      const expectedCode = 'expected-code';
      const expectedFilePath = 'expected-file-path';

      const extension = '.sh';
      const expectedName = `run.${extension}`;
      const folderName = 'privacy.sexy';
      const context = new TestContext();
      context.mocks.os.setupTmpdir('tmp');
      context.mocks.path.setupJoin('folder', 'tmp', folderName);
      context.mocks.path.setupJoin(expectedFilePath, 'folder', expectedName);

      // act
      await context
        .withCode(expectedCode)
        .withFolderName(folderName)
        .withExtension(extension)
        .runCode();

      // assert
      expect(context.mocks.fs.writeFileHistory.length).to.equal(1);
      expect(context.mocks.fs.writeFileHistory[0].data).to.equal(expectedCode);
      expect(context.mocks.fs.writeFileHistory[0].path).to.equal(expectedFilePath);
    });
    it('set file permissions as expected', async () => {
      // arrange
      const expectedMode = '755';
      const expectedFilePath = 'expected-file-path';

      const extension = '.sh';
      const expectedName = `run.${extension}`;
      const folderName = 'privacy.sexy';
      const context = new TestContext();
      context.mocks.os.setupTmpdir('tmp');
      context.mocks.path.setupJoin('folder', 'tmp', folderName);
      context.mocks.path.setupJoin(expectedFilePath, 'folder', expectedName);

      // act
      await context
        .withFolderName(folderName)
        .withExtension(extension)
        .runCode();

      // assert
      expect(context.mocks.fs.chmodCallHistory.length).to.equal(1);
      expect(context.mocks.fs.chmodCallHistory[0].mode).to.equal(expectedMode);
      expect(context.mocks.fs.chmodCallHistory[0].path).to.equal(expectedFilePath);
    });
    describe('executes as expected', () => {
      // arrange
      const filePath = 'expected-file-path';
      const testData = [{
        os: OperatingSystem.Windows,
        expected: filePath,
      }, {
        os: OperatingSystem.macOS,
        expected: `open -a Terminal.app ${filePath}`,
      }];
      for (const data of testData) {
        it(`returns ${data.expected} on ${OperatingSystem[data.os]}`, async () => {
          const context = new TestContext();
          context.mocks.os.setupTmpdir('non-important-temp-dir-name');
          context.mocks.path.setupJoinSequence('non-important-folder-name', filePath);
          context.withOs(data.os);

          // act
          await context
            .withOs(data.os)
            .runCode();

          // assert
          expect(context.mocks.child_process.executionHistory.length).to.equal(1);
          expect(context.mocks.child_process.executionHistory[0]).to.equal(data.expected);
        });
      }
    });
    it('runs in expected order', async () => {
      // arrange
      const expectedOrder = [NodeJsCommand.mkdir, NodeJsCommand.writeFile, NodeJsCommand.chmod];
      const context = new TestContext();
      context.mocks.os.setupTmpdir('non-important-temp-dir-name');
      context.mocks.path.setupJoinSequence('non-important-folder-name1', 'non-important-folder-name2');

      // act
      await context.runCode();

      // assert
      const actualOrder = context.mocks.commandHistory
        .filter((command) => expectedOrder.includes(command));
      expect(expectedOrder).to.deep.equal(actualOrder);
    });
  });
});

class TestContext {
  public mocks = getNodeJsMocks();

  private code = 'code';

  private folderName = 'folderName';

  private fileExtension = 'fileExtension';

  private env = mockEnvironment(OperatingSystem.Windows);

  public async runCode(): Promise<void> {
    const runner = new CodeRunner(this.mocks, this.env);
    await runner.runCode(this.code, this.folderName, this.fileExtension);
  }

  public withOs(os: OperatingSystem) {
    this.env = mockEnvironment(os);
    return this;
  }

  public withFolderName(folderName: string) {
    this.folderName = folderName;
    return this;
  }

  public withCode(code: string) {
    this.code = code;
    return this;
  }

  public withExtension(fileExtension: string) {
    this.fileExtension = fileExtension;
    return this;
  }
}

function mockEnvironment(os: OperatingSystem) {
  return new EnvironmentStub().withOs(os);
}

const enum NodeJsCommand { tmpdir, join, exec, mkdir, writeFile, chmod }

function getNodeJsMocks() {
  const commandHistory = new Array<NodeJsCommand>();
  return {
    os: mockOs(commandHistory),
    path: mockPath(commandHistory),
    fs: mockNodeFs(commandHistory),
    child_process: mockChildProcess(commandHistory),
    commandHistory,
  };
}

function mockOs(commandHistory: NodeJsCommand[]) {
  let tmpDir: string;
  return {
    setupTmpdir: (value: string): void => {
      tmpDir = value;
    },
    tmpdir: (): string => {
      if (!tmpDir) {
        throw new Error('tmpdir not set up');
      }
      commandHistory.push(NodeJsCommand.tmpdir);
      return tmpDir;
    },
  };
}

function mockPath(commandHistory: NodeJsCommand[]) {
  const sequence = new Array<string>();
  const scenarios = new Map<string, string>();
  const getScenarioKey = (paths: string[]) => paths.join('|');
  return {
    setupJoin: (returnValue: string, ...paths: string[]): void => {
      scenarios.set(getScenarioKey(paths), returnValue);
    },
    setupJoinSequence: (...valuesToReturn: string[]): void => {
      sequence.push(...valuesToReturn);
      sequence.reverse();
    },
    join: (...paths: string[]): string => {
      commandHistory.push(NodeJsCommand.join);
      if (sequence.length > 0) {
        return sequence.pop();
      }
      const key = getScenarioKey(paths);
      if (!scenarios.has(key)) {
        return paths.join('/');
      }
      return scenarios.get(key);
    },
  };
}

function mockChildProcess(commandHistory: NodeJsCommand[]) {
  const executionHistory = new Array<string>();
  return {
    exec: (command: string): void => {
      commandHistory.push(NodeJsCommand.exec);
      executionHistory.push(command);
    },
    executionHistory,
  };
}

function mockNodeFs(commandHistory: NodeJsCommand[]) {
  interface IMkdirCall { path: string; isRecursive: boolean; }
  interface IWriteFileCall { path: string; data: string; }
  interface IChmodCall { path: string; mode: string | number; }
  const mkdirHistory = new Array<IMkdirCall>();
  const writeFileHistory = new Array<IWriteFileCall>();
  const chmodCallHistory = new Array<IChmodCall>();
  return {
    promises: {
      mkdir: (path, options) => {
        commandHistory.push(NodeJsCommand.mkdir);
        mkdirHistory.push({ path, isRecursive: options && options.recursive });
        return Promise.resolve(path);
      },
      writeFile: (path, data) => {
        commandHistory.push(NodeJsCommand.writeFile);
        writeFileHistory.push({ path, data });
        return Promise.resolve();
      },
      chmod: (path, mode) => {
        commandHistory.push(NodeJsCommand.chmod);
        chmodCallHistory.push({ path, mode });
        return Promise.resolve();
      },
    },
    mkdirHistory,
    writeFileHistory,
    chmodCallHistory,
  };
}
