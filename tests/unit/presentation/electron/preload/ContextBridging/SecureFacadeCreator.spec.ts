import { describe, it, expect } from 'vitest';
import { createSecureFacade } from '@/presentation/electron/preload/ContextBridging/SecureFacadeCreator';

describe('SecureFacadeCreator', () => {
  describe('createSecureFacade', () => {
    describe('methods', () => {
      it('allows access to external methods', () => {
        // arrange
        let value = 0;
        const testObject = {
          increment: () => value++,
        };
        const facade = createSecureFacade(testObject, ['increment']);

        // act
        facade.increment();

        // assert
        expect(value).toBe(1);
      });
      it('proxies external methods', () => {
        // arrange
        const testObject = {
          method: () => {},
        };
        const facade = createSecureFacade(testObject, ['method']);

        // act
        const actualMethod = facade.method;

        // assert
        expect(testObject.method).not.equal(actualMethod);
        expect(testObject.method).not.equal(actualMethod);
      });
      it('does not expose internal methods', () => {
        // arrange
        interface External {
          publicMethod(): void;
        }
        interface Internal {
          privateMethod(): void;
        }
        const testObject: External & Internal = {
          publicMethod: () => {},
          privateMethod: () => {},
        };
        const facade = createSecureFacade<External>(testObject, ['publicMethod']);

        // act
        facade.publicMethod();

        // assert
        expect((facade as unknown as Internal).privateMethod).toBeUndefined();
      });
      it('maintains original function context', () => {
        // arrange
        const testObject = {
          value: 0,
          increment() { this.value++; },
        };
        // act
        const facade = createSecureFacade(testObject, ['increment', 'value']);
        // assert
        facade.increment();
        expect(testObject.value).toBe(1);
      });
    });
    describe('properties', () => {
      it('allows access to external properties', () => {
        // arrange
        const testObject = { a: 1 };
        // act
        const facade = createSecureFacade(testObject, ['a']);
        // assert
        expect(facade.a).toBe(1);
      });
      it('does not expose internal properties', () => {
        // arrange
        interface External {
          readonly public: string;
        }
        interface Internal {
          readonly private: string;
        }
        const testObject: External & Internal = {
          public: '',
          private: '',
        };
        const facade = createSecureFacade<External>(testObject, ['public']);

        // act
        (() => facade.public)();

        // assert
        expect((facade as unknown as Internal).private).toBeUndefined();
      });
    });
  });
});
