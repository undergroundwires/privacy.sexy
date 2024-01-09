import { describe, it, expect } from 'vitest';
import {
  BrowserRuntimeEnvironmentFactory, NodeRuntimeEnvironmentFactory,
  GlobalAccessor as GlobalPropertiesAccessor, determineAndCreateRuntimeEnvironment,
} from '@/infrastructure/RuntimeEnvironment/RuntimeEnvironmentFactory';
import { RuntimeEnvironmentStub } from '@tests/unit/shared/Stubs/RuntimeEnvironmentStub';

describe('RuntimeEnvironmentFactory', () => {
  describe('determineAndCreateRuntimeEnvironment', () => {
    it('uses browser environment when window exists', () => {
      // arrange
      const expectedEnvironment = new RuntimeEnvironmentStub();
      const context = new RuntimeEnvironmentFactoryTestSetup()
        .withWindowAccessor(() => createWindowStub())
        .withBrowserEnvironmentFactory(() => expectedEnvironment);
      // act
      const actualEnvironment = context.buildEnvironment();
      // assert
      expect(actualEnvironment).to.equal(expectedEnvironment);
    });

    it('passes correct window to browser environment', () => {
      // arrange
      const expectedWindow = createWindowStub();
      let actualWindow: Window | undefined;
      const browserEnvironmentFactoryMock: BrowserRuntimeEnvironmentFactory = (providedWindow) => {
        actualWindow = providedWindow;
        return new RuntimeEnvironmentStub();
      };
      const context = new RuntimeEnvironmentFactoryTestSetup()
        .withWindowAccessor(() => expectedWindow)
        .withBrowserEnvironmentFactory(browserEnvironmentFactoryMock);
      // act
      context.buildEnvironment();
      // assert
      expect(actualWindow).to.equal(expectedWindow);
    });

    it('uses node environment when window is absent', () => {
      // arrange
      const expectedEnvironment = new RuntimeEnvironmentStub();
      const context = new RuntimeEnvironmentFactoryTestSetup()
        .withWindowAccessor(() => undefined)
        .withProcessAccessor(() => createProcessStub())
        .withNodeEnvironmentFactory(() => expectedEnvironment);
      // act
      const actualEnvironment = context.buildEnvironment();
      // assert
      expect(actualEnvironment).to.equal(expectedEnvironment);
    });

    it('uses node environment when window is present too', () => { // This allows running integration tests
      // arrange
      const expectedEnvironment = new RuntimeEnvironmentStub();
      const context = new RuntimeEnvironmentFactoryTestSetup()
        .withWindowAccessor(() => createWindowStub())
        .withProcessAccessor(() => createProcessStub())
        .withNodeEnvironmentFactory(() => expectedEnvironment);
      // act
      const actualEnvironment = context.buildEnvironment();
      // assert
      expect(actualEnvironment).to.equal(expectedEnvironment);
    });

    it('throws if both node and window are missing', () => {
      // arrange
      const expectedError = 'Unsupported runtime environment: The current context is neither a recognized browser nor a Node.js environment.';
      const context = new RuntimeEnvironmentFactoryTestSetup()
        .withWindowAccessor(() => undefined)
        .withProcessAccessor(() => undefined);
      // act
      const act = () => context.buildEnvironment();
      // assert
      expect(act).to.throw(expectedError);
    });
  });
});

function createWindowStub(): Window {
  return {} as Window;
}

function createProcessStub(): NodeJS.Process {
  return {} as NodeJS.Process;
}

type WindowAccessor = GlobalPropertiesAccessor['getGlobalWindow'];

type ProcessAccessor = GlobalPropertiesAccessor['getGlobalProcess'];

export class RuntimeEnvironmentFactoryTestSetup {
  private windowAccessor: WindowAccessor = () => undefined;

  private processAccessor: ProcessAccessor = () => undefined;

  private browserEnvironmentFactory
  : BrowserRuntimeEnvironmentFactory = () => new RuntimeEnvironmentStub();

  private nodeEnvironmentFactory
  : NodeRuntimeEnvironmentFactory = () => new RuntimeEnvironmentStub();

  public withWindowAccessor(windowAccessor: WindowAccessor): this {
    this.windowAccessor = windowAccessor;
    return this;
  }

  public withProcessAccessor(processAccessor: ProcessAccessor): this {
    this.processAccessor = processAccessor;
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
        getGlobalProcess: this.processAccessor,
        getGlobalWindow: this.windowAccessor,
      },
      this.browserEnvironmentFactory,
      this.nodeEnvironmentFactory,
    );
  }
}
