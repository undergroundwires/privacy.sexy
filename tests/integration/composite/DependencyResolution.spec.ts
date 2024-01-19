import { it, describe, expect } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { defineComponent, inject } from 'vue';
import { InjectionKeySelector, InjectionKeys, injectKey } from '@/presentation/injectionSymbols';
import { provideDependencies } from '@/presentation/bootstrapping/DependencyProvider';
import { buildContext } from '@/application/Context/ApplicationContextFactory';
import { IApplicationContext } from '@/application/Context/IApplicationContext';

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
        expect(resolvedDependency).to.toBeDefined();
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
  shallowMount(defineComponent({
    setup() {
      injectedDependency = injectKey(selector);
    },
  }), {
    global: {
      provide: providedKeys,
    },
  });
  return injectedDependency;
}
