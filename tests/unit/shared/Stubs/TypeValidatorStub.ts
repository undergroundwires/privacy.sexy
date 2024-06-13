import type { NonEmptyCollectionAssertion, ObjectAssertion, TypeValidator } from '@/application/Parser/Common/TypeValidator';
import type { FunctionKeys } from '@/TypeHelpers';
import { expectDeepIncludes } from '@tests/shared/Assertions/ExpectDeepIncludes';
import { StubWithObservableMethodCalls } from './StubWithObservableMethodCalls';

export type UnknownObjectAssertion = ObjectAssertion<unknown>;

export class TypeValidatorStub
  extends StubWithObservableMethodCalls<TypeValidator>
  implements TypeValidator {
  public assertObject<T>(assertion: ObjectAssertion<T>): void {
    this.registerMethodCall({
      methodName: 'assertObject',
      args: [assertion as UnknownObjectAssertion],
    });
  }

  public assertNonEmptyCollection(assertion: NonEmptyCollectionAssertion): void {
    this.registerMethodCall({
      methodName: 'assertNonEmptyCollection',
      args: [assertion],
    });
  }

  public expectObjectAssertion<T>(
    expectedAssertion: ObjectAssertion<T>,
  ): void {
    this.expectAssertion('assertObject', expectedAssertion as UnknownObjectAssertion);
  }

  public expectNonEmptyCollectionAssertion(
    expectedAssertion: NonEmptyCollectionAssertion,
  ): void {
    this.expectAssertion('assertNonEmptyCollection', expectedAssertion);
  }

  private expectAssertion<T extends FunctionKeys<TypeValidator>>(
    methodName: T,
    expectedAssertion: Parameters<TypeValidator[T]>[0],
  ): void {
    const assertionCalls = this.callHistory.filter((c) => c.methodName === methodName);
    const assertionArgs = assertionCalls.map((c) => c.args[0]);
    expectDeepIncludes(assertionArgs, expectedAssertion);
  }
}
