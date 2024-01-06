import { describe, it, expect } from 'vitest';
import {
  BrowserRuntimeEnvironmentFactory, NodeRuntimeEnvironmentFactory,
  WindowAccessor, determineAndCreateRuntimeEnvironment,
} from '@/infrastructure/RuntimeEnvironment/RuntimeEnvironmentFactory';
import { RuntimeEnvironmentStub } from '@tests/unit/shared/Stubs/RuntimeEnvironmentStub';

describe('RuntimeEnvironmentFactory', () => {
  describe('determineAndCreateRuntimeEnvironment', () => {
    it('uses browser environment when window exists', () => {
      // arrange
      const expectedEnvironment = new RuntimeEnvironmentStub();
      const context = new RuntimeEnvironmentFactoryTestSetup()
        .withWindowAccessor(() => { return {} as Window; })
        .withBrowserEnvironmentFactory(() => expectedEnvironment);
      // act
      const actualEnvironment = context.buildEnvironment();
      // assert
      expect(actualEnvironment).to.equal(expectedEnvironment);
    });

    it('passes correct window to browser environment', () => {
      // arrange
      const expectedWindow = {} as Window;
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
        .withNodeEnvironmentFactory(() => expectedEnvironment);
      // act
      const actualEnvironment = context.buildEnvironment();
      // assert
      expect(actualEnvironment).to.equal(expectedEnvironment);
    });
  });
});

export class RuntimeEnvironmentFactoryTestSetup {
  private windowAccessor: WindowAccessor = () => undefined;

  private browserEnvironmentFactory
  : BrowserRuntimeEnvironmentFactory = () => new RuntimeEnvironmentStub();

  private nodeEnvironmentFactory
  : NodeRuntimeEnvironmentFactory = () => new RuntimeEnvironmentStub();

  public withWindowAccessor(windowAccessor: WindowAccessor): this {
    this.windowAccessor = windowAccessor;
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
      this.windowAccessor,
      this.browserEnvironmentFactory,
      this.nodeEnvironmentFactory,
    );
  }
}
