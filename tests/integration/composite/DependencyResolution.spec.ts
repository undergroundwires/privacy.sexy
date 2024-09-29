import { it, describe, expect } from 'vitest';
import { inject } from 'vue';
import { type InjectionKeySelector, InjectionKeys, injectKey } from '@/presentation/injectionSymbols';
import { provideDependencies } from '@/presentation/bootstrapping/DependencyProvider';
import { buildContext } from '@/application/Context/ApplicationContextFactory';
import type { IApplicationContext } from '@/application/Context/IApplicationContext';
import { executeInComponentSetupContext } from '@tests/shared/Vue/ExecuteInComponentSetupContext';

describe('DependencyResolution', () => {
  describe('all dependencies can be injected', async () => {
    // arrange
    const context = await buildContext();
    const dependencies = collectProvidedKeys(context);
    Object.values(InjectionKeys).forEach((key) => {
      it(`"${key.key.description}"`, () => {
        // act
        const resolvedDependency = resolve(() => key, dependencies);
        // assert
        expect(resolvedDependency).toBeDefined();
      });
    });
  });
});

type ProvidedKeys = Record<symbol, unknown>;

function collectProvidedKeys(context: IApplicationContext): ProvidedKeys {
  const providedKeys: ProvidedKeys = {};
  provideDependencies(context, {
    inject,
    provide: (key, value) => {
      providedKeys[key as symbol] = value;
    },
  });
  return providedKeys;
}

function resolve<T>(
  selector: InjectionKeySelector<T>,
  providedKeys: ProvidedKeys,
): T | undefined {
  let injectedDependency: T | undefined;
  executeInComponentSetupContext({
    setupCallback: () => {
      injectedDependency = injectKey(selector);
    },
    mountOptions: {
      global: {
        provide: providedKeys,
      },
    },
  });
  return injectedDependency;
}
