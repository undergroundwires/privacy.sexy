import { describe, it, expect } from 'vitest';
import { ApplicationContextStub } from '@tests/unit/shared/Stubs/ApplicationContextStub';
import { DependencyBootstrapper } from '@/presentation/bootstrapping/Modules/DependencyBootstrapper';
import type { IApplicationContext } from '@/application/Context/IApplicationContext';
import { VueDependencyInjectionApiStub } from '@tests/unit/shared/Stubs/VueDependencyInjectionApiStub';
import { buildContext } from '@/application/Context/ApplicationContextFactory';
import { provideDependencies } from '@/presentation/bootstrapping/DependencyProvider';
import type { App, inject } from 'vue';

describe('DependencyBootstrapper', () => {
  describe('bootstrap', () => {
    it('calls the contextFactory', async () => {
      // arrange
      const { mockContext, mockApp } = createMocks();
      let contextFactoryCalled = false;
      const sut = new DependencyBootstrapperBuilder()
        .withContextFactory(async () => {
          contextFactoryCalled = true;
          return mockContext;
        })
        .build();
      // act
      await sut.bootstrap(mockApp);
      // assert
      expect(contextFactoryCalled).to.equal(true);
    });
    it('provides correct context to dependency provider', async () => {
      // arrange
      const { mockContext, mockApp } = createMocks();
      const expectedContext = mockContext;
      let actualContext: IApplicationContext | undefined;
      const sut = new DependencyBootstrapperBuilder()
        .withContextFactory(async () => expectedContext)
        .withDependencyProvider((...params) => {
          const [context] = params;
          actualContext = context;
        })
        .build();
      // act
      await sut.bootstrap(mockApp);
      // assert
      expect(actualContext).to.equal(expectedContext);
    });
    it('provides correct provide function to dependency provider', async () => {
      // arrange
      const { mockApp, provideMock } = createMocks();
      const expectedProvide = provideMock;
      let actualProvide: typeof expectedProvide | undefined;
      const sut = new DependencyBootstrapperBuilder()
        .withDependencyProvider((...params) => {
          actualProvide = params[1]?.provide;
        })
        .build();
      // act
      await sut.bootstrap(mockApp);
      // assert
      expect(actualProvide).to.equal(expectedProvide);
    });
    it('provides correct inject function to dependency provider', async () => {
      // arrange
      const { mockApp } = createMocks();
      const expectedInjector = new VueDependencyInjectionApiStub().inject;
      let actualInjector: Injector | undefined;
      const sut = new DependencyBootstrapperBuilder()
        .withInjector(expectedInjector)
        .withDependencyProvider((...params) => {
          actualInjector = params[1]?.inject;
        })
        .build();
      // act
      await sut.bootstrap(mockApp);
      // assert
      expect(actualInjector).to.equal(expectedInjector);
    });
  });
});

function createMocks() {
  const provideMock = new VueDependencyInjectionApiStub().provide;
  const mockContext = new ApplicationContextStub();
  const mockApp = {
    provide: provideMock,
  } as unknown as App;
  return { mockContext, mockApp, provideMock };
}

type Injector = typeof inject;
type Provider = typeof provideDependencies;
type ContextFactory = typeof buildContext;

class DependencyBootstrapperBuilder {
  private contextFactory: ContextFactory = () => Promise.resolve(new ApplicationContextStub());

  private dependencyProvider: Provider = () => new VueDependencyInjectionApiStub().provide;

  private injector: Injector = () => new VueDependencyInjectionApiStub().inject;

  public withContextFactory(contextFactory: ContextFactory): this {
    this.contextFactory = contextFactory;
    return this;
  }

  public withInjector(injector: Injector): this {
    this.injector = injector;
    return this;
  }

  public withDependencyProvider(dependencyProvider: Provider): this {
    this.dependencyProvider = dependencyProvider;
    return this;
  }

  public build(): DependencyBootstrapper {
    return new DependencyBootstrapper(
      this.contextFactory,
      this.dependencyProvider,
      this.injector,
    );
  }
}
