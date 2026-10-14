import { describe, expectTypeOf, it } from 'vitest';
import type { Constructible, FunctionKeys, PropertyKeys } from '@/TypeHelpers';
import type { MethodCall } from '@tests/unit/shared/Stubs/StubWithObservableMethodCalls';

interface ExampleApi {
  readonly label: string;
  setValue(value: string): void;
  clear(): void;
  collect(...values: number[]): Promise<number>;
}

describe('type helpers under strict function variance', () => {
  it('recognizes methods with required and rest parameters', () => {
    expectTypeOf<FunctionKeys<ExampleApi>>().toEqualTypeOf<'setValue' | 'clear' | 'collect'>();
  });

  it('excludes parameterized methods from property keys', () => {
    expectTypeOf<PropertyKeys<ExampleApi>>().toEqualTypeOf<'label'>();
  });

  it('preserves the argument tuple for a recorded method name', () => {
    type SetValueCall = Extract<MethodCall<ExampleApi>, { methodName: 'setValue' }>;
    expectTypeOf<SetValueCall['args']>().toEqualTypeOf<[value: string]>();
  });

  it('accepts constructor metadata without requiring public construction', () => {
    expectTypeOf<typeof PrivateConstructor>().toExtend<Constructible<PrivateConstructor>>();
  });
});

class PrivateConstructor {
  private constructor() {
    throw new Error('Constructor metadata checks must not instantiate this class.');
  }
}
