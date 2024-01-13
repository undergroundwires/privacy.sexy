import { describe, it, expect } from 'vitest';
import {
  BrowserRuntimeEnvironmentFactory, GlobalPropertiesAccessor, NodeRuntimeEnvironmentFactory,
  determineAndCreateRuntimeEnvironment,
} from '@/infrastructure/RuntimeEnvironment/RuntimeEnvironmentFactory';
import { RuntimeEnvironmentStub } from '@tests/unit/shared/Stubs/RuntimeEnvironmentStub';

describe('RuntimeEnvironmentFactory', () => {
  describe('determineAndCreateRuntimeEnvironment', () => {
    describe('Node environment creation', () => {
      it('selects Node environment if Electron main process detected', () => {
        // arrange
        const processStub = createProcessStub({
          versions: {
            electron: '28.1.3',
          } as NodeJS.ProcessVersions,
        });
        const expectedEnvironment = new RuntimeEnvironmentStub();
        const context = new RuntimeEnvironmentFactoryTestSetup()
          .withGlobalProcess(processStub)
          .withNodeEnvironmentFactory(() => expectedEnvironment);
        // act
        const actualEnvironment = context.buildEnvironment();
        // assert
        expect(actualEnvironment).to.equal(expectedEnvironment);
      });
      it('passes correct process to Node environment factory', () => {
        // arrange
        const expectedProcess = createProcessStub({
          versions: {
            electron: '28.1.3',
          } as NodeJS.ProcessVersions,
        });
        let actualProcess: GlobalProcess;
        const nodeEnvironmentFactoryMock: NodeRuntimeEnvironmentFactory = (providedProcess) => {
          actualProcess = providedProcess;
          return new RuntimeEnvironmentStub();
        };
        const context = new RuntimeEnvironmentFactoryTestSetup()
          .withGlobalProcess(expectedProcess)
          .withNodeEnvironmentFactory(nodeEnvironmentFactoryMock);
        // act
        context.buildEnvironment();
        // assert
        expect(actualProcess).to.equal(expectedProcess);
      });
    });
    describe('browser environment creation', () => {
      it('selects browser environment if Electron main process not detected', () => {
        // arrange
        const expectedEnvironment = new RuntimeEnvironmentStub();
        const undefinedProcess: GlobalProcess = undefined;
        const windowStub = createWindowStub();
        const context = new RuntimeEnvironmentFactoryTestSetup()
          .withGlobalProcess(undefinedProcess)
          .withGlobalWindow(windowStub)
          .withBrowserEnvironmentFactory(() => expectedEnvironment);
        // act
        const actualEnvironment = context.buildEnvironment();
        // assert
        expect(actualEnvironment).to.equal(expectedEnvironment);
      });
      it('passes correct window to browser environment factory', () => {
        // arrange
        const expectedWindow = createWindowStub({
          isRunningAsDesktopApplication: undefined,
        });
        let actualWindow: GlobalWindow;
        const browserEnvironmentFactoryMock
        : BrowserRuntimeEnvironmentFactory = (providedWindow) => {
          actualWindow = providedWindow;
          return new RuntimeEnvironmentStub();
        };
        const undefinedProcess: GlobalProcess = undefined;
        const context = new RuntimeEnvironmentFactoryTestSetup()
          .withGlobalWindow(expectedWindow)
          .withGlobalProcess(undefinedProcess)
          .withBrowserEnvironmentFactory(browserEnvironmentFactoryMock);
        // act
        context.buildEnvironment();
        // assert
        expect(actualWindow).to.equal(expectedWindow);
      });
    });
    it('throws error when both window and process are undefined', () => {
      // arrange
      const undefinedWindow: GlobalWindow = undefined;
      const undefinedProcess: GlobalProcess = undefined;
      const expectedError = 'Unsupported runtime environment: The current context is neither a recognized browser nor a desktop environment.';
      const context = new RuntimeEnvironmentFactoryTestSetup()
        .withGlobalProcess(undefinedProcess)
        .withGlobalWindow(undefinedWindow);
      // act
      const act = () => context.buildEnvironment();
      // assert
      expect(act).to.throw(expectedError);
    });
  });
});

function createWindowStub(partialWindowProperties?: Partial<Window>): Window {
  return {
    ...partialWindowProperties,
  } as Window;
}

function createProcessStub(partialProcessProperties?: Partial<NodeJS.Process>): NodeJS.Process {
  return {
    ...partialProcessProperties,
  } as NodeJS.Process;
}

export class RuntimeEnvironmentFactoryTestSetup {
  private globalWindow: GlobalWindow = createWindowStub();

  private globalProcess: GlobalProcess = createProcessStub();

  private browserEnvironmentFactory
  : BrowserRuntimeEnvironmentFactory = () => new RuntimeEnvironmentStub();

  private nodeEnvironmentFactory
  : NodeRuntimeEnvironmentFactory = () => new RuntimeEnvironmentStub();

  public withGlobalWindow(globalWindow: GlobalWindow): this {
    this.globalWindow = globalWindow;
    return this;
  }

  public withGlobalProcess(globalProcess: GlobalProcess): this {
    this.globalProcess = globalProcess;
    return this;
  }

  public withNodeEnvironmentFactory(
    nodeEnvironmentFactory: NodeRuntimeEnvironmentFactory,
  ): this {
    this.nodeEnvironmentFactory = nodeEnvironmentFactory;
    return this;
  }

  public withBrowserEnvironmentFactory(
    browserEnvironmentFactory: BrowserRuntimeEnvironmentFactory,
  ): this {
    this.browserEnvironmentFactory = browserEnvironmentFactory;
    return this;
  }

  public buildEnvironment(): ReturnType<typeof determineAndCreateRuntimeEnvironment> {
    return determineAndCreateRuntimeEnvironment(
      {
        window: this.globalWindow,
        process: this.globalProcess,
      },
      this.browserEnvironmentFactory,
      this.nodeEnvironmentFactory,
    );
  }
}

type GlobalWindow = GlobalPropertiesAccessor['window'];

type GlobalProcess = GlobalPropertiesAccessor['process'];
