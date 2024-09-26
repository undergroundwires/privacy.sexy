import { describe } from 'vitest';
import { VueDependencyInjectionApiStub } from '@tests/unit/shared/Stubs/VueDependencyInjectionApiStub';
import { InjectionKeys } from '@/presentation/injectionSymbols';
import { provideDependencies, type VueDependencyInjectionApi } from '@/presentation/bootstrapping/DependencyProvider';
import { ApplicationContextStub } from '@tests/unit/shared/Stubs/ApplicationContextStub';
import { itIsSingletonFactory } from '@tests/unit/shared/TestCases/SingletonFactoryTests';
import type { IApplicationContext } from '@/application/Context/IApplicationContext';
import { itIsTransientFactory } from '@tests/unit/shared/TestCases/TransientFactoryTests';
import { executeInComponentSetupContext } from '@tests/shared/Vue/ExecuteInComponentSetupContext';
import type { PropertyKeys } from '@/TypeHelpers';

type InjectionKeyType = PropertyKeys<typeof InjectionKeys>;
type DependencyInjectionTestFunction = (injectionKey: symbol) => void;

describe('DependencyProvider', () => {
  describe('provideDependencies', () => {
    const testCases: Record<InjectionKeyType, DependencyInjectionTestFunction> = {
      useCollectionState: createTransientTests(),
      useApplication: createSingletonTests(),
      useRuntimeEnvironment: createSingletonTests(),
      useAutoUnsubscribedEvents: createTransientTests(),
      useClipboard: createTransientTests(),
      useCurrentCode: createTransientTests(),
      useUserSelectionState: createTransientTests(),
      useLogger: createTransientTests(),
      useCodeRunner: createTransientTests(),
      useDialog: createTransientTests(),
      useScriptDiagnosticsCollector: createTransientTests(),
      useAutoUnsubscribedEventListener: createTransientTests(),
    };
    Object.entries(testCases).forEach(([key, runTests]) => {
      const injectionKey = key as InjectionKeyType;
      const registeredKey = InjectionKeys[injectionKey].key;
      describe(`Key: "${registeredKey.toString()}"`, () => {
        runTests(registeredKey);
      });
    });
  });
});

function createTransientTests(): DependencyInjectionTestFunction {
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
    describe('should return different instances for transient dependency', () => {
      // arrange
      const api = new VueDependencyInjectionApiStub();
      new ProvideDependenciesBuilder()
        .withApi(api)
        .provideDependencies();
      // act
      const getFactoryResult = () => {
        const registeredFactory = api.inject(injectionKey) as () => unknown;
        let factoryResult: unknown;
        executeInComponentSetupContext({
          setupCallback: () => {
            factoryResult = registeredFactory();
          },
        });
        return factoryResult;
      };
      // assert
      itIsTransientFactory({
        getter: getFactoryResult,
      });
    });
  };
}

function createSingletonTests(): DependencyInjectionTestFunction {
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
    describe('should return the same instance for singleton dependency', () => {
      // arrange
      const singletonContext = new ApplicationContextStub();
      const api = new VueDependencyInjectionApiStub();
      new ProvideDependenciesBuilder()
        .withContext(singletonContext)
        .withApi(api)
        .provideDependencies();
      // act
      const getRegisteredInstance = () => api.inject(injectionKey);
      // assert
      itIsSingletonFactory({
        getter: getRegisteredInstance,
      });
    });
  };
}

class ProvideDependenciesBuilder {
  private context: IApplicationContext = new ApplicationContextStub();

  private api: VueDependencyInjectionApi = new VueDependencyInjectionApiStub();

  public withApi(api: VueDependencyInjectionApi): this {
    this.api = api;
    return this;
  }

  public withContext(context: IApplicationContext): this {
    this.context = context;
    return this;
  }

  public provideDependencies() {
    return provideDependencies(this.context, this.api);
  }
}
