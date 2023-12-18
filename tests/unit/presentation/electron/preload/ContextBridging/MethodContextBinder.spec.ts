/* eslint-disable max-classes-per-file */
import { describe, it, expect } from 'vitest';
import { bindObjectMethods } from '@/presentation/electron/preload/ContextBridging/MethodContextBinder';

describe('MethodContextBinder', () => {
  describe('bindObjectMethods', () => {
    it('binds methods of an object to itself', () => {
      // arrange
      class TestClass {
        constructor(public value: number) {}

        increment() {
          this.value += 1;
        }
      }
      const instance = new TestClass(0);

      // act
      const boundInstance = bindObjectMethods(instance);
      boundInstance.increment();

      // assert
      expect(boundInstance.value).toBe(1);
    });

    it('handles objects without prototype methods gracefully', () => {
      // arrange
      const object = Object.create(null); // object without prototype
      object.value = 0;
      // eslint-disable-next-line func-names
      object.increment = function () {
        this.value += 1;
      };

      // act
      const boundObject = bindObjectMethods(object);

      // assert
      expect(() => boundObject.increment()).not.toThrow();
    });

    it('recursively binds methods in nested objects', () => {
      // arrange
      const nestedObject = {
        child: {
          value: 0,
          increment() {
            this.value += 1;
          },
        },
      };

      // act
      const boundObject = bindObjectMethods(nestedObject);
      boundObject.child.increment();

      // assert
      expect(boundObject.child.value).toBe(1);
    });

    it('recursively binds methods in arrays', () => {
      // arrange
      const array = [
        {
          value: 0,
          increment() {
            this.value += 1;
          },
        },
      ];

      // act
      const boundArray = bindObjectMethods(array);
      boundArray[0].increment();

      // assert
      expect(boundArray[0].value).toBe(1);
    });

    describe('returns the same object if it is neither an object nor an array', () => {
      const testScenarios: ReadonlyArray<{
        readonly description: string;
        readonly value: unknown;
      }> = [
        {
          description: 'given primitive',
          value: 42,
        },
        {
          description: 'null',
          value: null,
        },
        {
          description: 'undefined',
          value: undefined,
        },
      ];
      testScenarios.forEach(({ description, value }) => {
        it(description, () => {
          // act
          const boundValue = bindObjectMethods(value);
          // assert
          expect(boundValue).toBe(value);
        });
      });
    });

    it('skips binding inherited properties', () => {
      // arrange
      class ParentClass {
        inheritedMethod() {}
      }
      class TestClass extends ParentClass {
        constructor(public value: number) {
          super();
        }

        increment() {
          this.value += 1;
        }
      }
      const instance = new TestClass(0);
      const originalInheritedMethod = instance.inheritedMethod;

      // act
      const boundInstance = bindObjectMethods(instance);

      // assert
      expect(boundInstance.inheritedMethod).toBe(originalInheritedMethod);
    });
  });
});
