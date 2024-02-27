import { describe, it, expect } from 'vitest';
import {
  type BrowserRuntimeEnvironmentFactory, type NodeRuntimeEnvironmentFactory,
  determineAndCreateRuntimeEnvironment,
} from '@/infrastructure/RuntimeEnvironment/RuntimeEnvironmentFactory';
import { RuntimeEnvironmentStub } from '@tests/unit/shared/Stubs/RuntimeEnvironmentStub';
import type { ElectronEnvironmentDetector } from '@/infrastructure/RuntimeEnvironment/Electron/ElectronEnvironmentDetector';
import { ElectronEnvironmentDetectorStub } from '@tests/unit/shared/Stubs/ElectronEnvironmentDetectorStub';

describe('RuntimeEnvironmentFactory', () => {
  describe('determineAndCreateRuntimeEnvironment', () => {
    describe('Node environment creation', () => {
      it('creates Node environment in Electron main process', () => {
        // arrange
        const expectedEnvironment = new RuntimeEnvironmentStub();
        const mainProcessDetector = new ElectronEnvironmentDetectorStub()
          .withElectronEnvironment('main');
        const context = new RuntimeEnvironmentFactoryTestSetup()
          .withElectronEnvironmentDetector(mainProcessDetector)
          .withNodeEnvironmentFactory(() => expectedEnvironment);
        // act
        const actualEnvironment = context.buildEnvironment();
        // assert
        expect(actualEnvironment).to.equal(expectedEnvironment);
      });
    });
    describe('browser environment creation', () => {
      it('creates browser environment in Electron renderer process', () => {
        // arrange
        const expectedEnvironment = new RuntimeEnvironmentStub();
        const rendererProcessDetector = new ElectronEnvironmentDetectorStub()
          .withElectronEnvironment('renderer');
        const windowStub = createWindowStub();
        const context = new RuntimeEnvironmentFactoryTestSetup()
          .withElectronEnvironmentDetector(rendererProcessDetector)
          .withGlobalWindow(windowStub)
          .withBrowserEnvironmentFactory(() => expectedEnvironment);
        // act
        const actualEnvironment = context.buildEnvironment();
        // assert
        expect(actualEnvironment).to.equal(expectedEnvironment);
      });
      it('creates browser environment in Electron preloader process', () => {
        // arrange
        const expectedEnvironment = new RuntimeEnvironmentStub();
        const preloaderProcessDetector = new ElectronEnvironmentDetectorStub()
          .withElectronEnvironment('preloader');
        const windowStub = createWindowStub();
        const context = new RuntimeEnvironmentFactoryTestSetup()
          .withElectronEnvironmentDetector(preloaderProcessDetector)
          .withGlobalWindow(windowStub)
          .withBrowserEnvironmentFactory(() => expectedEnvironment);
        // act
        const actualEnvironment = context.buildEnvironment();
        // assert
        expect(actualEnvironment).to.equal(expectedEnvironment);
      });
      it('provides correct window to browser environment factory', () => {
        // arrange
        const expectedWindow = createWindowStub({
          isRunningAsDesktopApplication: undefined,
        });
        let actualWindow: Window | undefined;
        const browserEnvironmentFactoryMock
        : BrowserRuntimeEnvironmentFactory = (providedWindow) => {
          actualWindow = providedWindow;
          return new RuntimeEnvironmentStub();
        };
        const nonElectronDetector = new ElectronEnvironmentDetectorStub()
          .withNonElectronEnvironment();
        const context = new RuntimeEnvironmentFactoryTestSetup()
          .withGlobalWindow(expectedWindow)
          .withElectronEnvironmentDetector(nonElectronDetector)
          .withBrowserEnvironmentFactory(browserEnvironmentFactoryMock);
        // act
        context.buildEnvironment();
        // assert
        expect(actualWindow).to.equal(expectedWindow);
      });
    });
    it('throws error without global window in non-Electron environment', () => {
      // arrange
      const expectedError = 'Unsupported runtime environment: The current context is neither a recognized browser nor a desktop environment.';
      const nullWindow = null;
      const nonElectronDetector = new ElectronEnvironmentDetectorStub()
        .withNonElectronEnvironment();
      const context = new RuntimeEnvironmentFactoryTestSetup()
        .withElectronEnvironmentDetector(nonElectronDetector)
        .withGlobalWindow(nullWindow);
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

export class RuntimeEnvironmentFactoryTestSetup {
  private globalWindow: Window | undefined | null = createWindowStub();

  private electronEnvironmentDetector
  : ElectronEnvironmentDetector = new ElectronEnvironmentDetectorStub();

  private browserEnvironmentFactory
  : BrowserRuntimeEnvironmentFactory = () => new RuntimeEnvironmentStub();

  private nodeEnvironmentFactory
  : NodeRuntimeEnvironmentFactory = () => new RuntimeEnvironmentStub();

  public withGlobalWindow(globalWindow: Window | undefined | null): this {
    this.globalWindow = globalWindow;
    return this;
  }

  public withElectronEnvironmentDetector(detector: ElectronEnvironmentDetector): this {
    this.electronEnvironmentDetector = detector;
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
      this.globalWindow,
      this.electronEnvironmentDetector,
      this.browserEnvironmentFactory,
      this.nodeEnvironmentFactory,
    );
  }
}
