import { describe } from 'vitest';
import { VueDependencyInjectionApiStub } from '@tests/unit/shared/Stubs/VueDependencyInjectionApiStub';
import { InjectionKeys } from '@/presentation/injectionSymbols';
import { provideDependencies, VueDependencyInjectionApi } from '@/presentation/bootstrapping/DependencyProvider';
import { ApplicationContextStub } from '@tests/unit/shared/Stubs/ApplicationContextStub';
import { itIsSingleton } from '@tests/unit/shared/TestCases/SingletonTests';

describe('DependencyProvider', () => {
  describe('provideDependencies', () => {
    const testCases: {
      readonly [K in keyof typeof InjectionKeys]: (injectionKey: symbol) => void;
    } = {
      useCollectionState: createTransientTests(),
      useApplication: createSingletonTests(),
      useRuntimeEnvironment: createSingletonTests(),
      useAutoUnsubscribedEvents: createTransientTests(),
      useClipboard: createTransientTests(),
      useCurrentCode: createTransientTests(),
    };
    Object.entries(testCases).forEach(([key, runTests]) => {
      describe(`Key: "${key}"`, () => {
        runTests(InjectionKeys[key]);
      });
    });
  });
});

function createTransientTests() {
  return (injectionKey: symbol) => {
    it('should register a function when transient dependency is resolved', () => {
      // arrange
      const api = new VueDependencyInjectionApiStub();
      // act
      new ProvideDependenciesBuilder()
        .withApi(api)
        .provideDependencies();
      // expect
      const registeredObject = api.inject(injectionKey);
      expect(registeredObject).to.be.instanceOf(Function);
    });
    it('should return different instances for transient dependency', () => {
      // arrange
      const api = new VueDependencyInjectionApiStub();
      // act
      new ProvideDependenciesBuilder()
        .withApi(api)
        .provideDependencies();
      // expect
      const registeredObject = api.inject(injectionKey);
      const factory = registeredObject as () => unknown;
      const firstResult = factory();
      const secondResult = factory();
      expect(firstResult).to.not.equal(secondResult);
    });
  };
}

function createSingletonTests() {
  return (injectionKey: symbol) => {
    it('should register an object when singleton dependency is resolved', () => {
      // arrange
      const api = new VueDependencyInjectionApiStub();
      // act
      new ProvideDependenciesBuilder()
        .withApi(api)
        .provideDependencies();
      // expect
      const registeredObject = api.inject(injectionKey);
      expect(registeredObject).to.be.instanceOf(Object);
    });
    it('should return the same instance for singleton dependency', () => {
      itIsSingleton({
        getter: () => {
          // arrange
          const api = new VueDependencyInjectionApiStub();
          // act
          new ProvideDependenciesBuilder()
            .withApi(api)
            .provideDependencies();
          // expect
          const registeredObject = api.inject(injectionKey);
          return registeredObject;
        },
      });
    });
  };
}
class ProvideDependenciesBuilder {
  private context = new ApplicationContextStub();

  private api: VueDependencyInjectionApi = new VueDependencyInjectionApiStub();

  public withApi(api: VueDependencyInjectionApi): this {
    this.api = api;
    return this;
  }

  public provideDependencies() {
    return provideDependencies(this.context, this.api);
  }
}
