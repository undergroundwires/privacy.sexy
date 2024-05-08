import { describe, it, expect } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { nextTick, shallowRef } from 'vue';
import { useAutoUnsubscribedEventListener } from '@/presentation/components/Shared/Hooks/UseAutoUnsubscribedEventListener';
import { expectExists } from '@tests/shared/Assertions/ExpectExists';
import { expectDoesNotThrowAsync } from '@tests/shared/Assertions/ExpectThrowsAsync';

describe('UseAutoUnsubscribedEventListener', () => {
  describe('startListening', () => {
    describe('direct value', () => {
      it('immediately adds listener', () => {
        // arrange
        const eventTarget = new EventTarget();
        const eventType: keyof HTMLElementEventMap = 'abort';
        const expectedEvent = new CustomEvent(eventType);
        let actualEvent: Event | null = null;
        const callback = (event: Event) => {
          actualEvent = event;
        };
        // act
        const { returnObject } = mountWrapper();
        returnObject.startListening(eventTarget, eventType, callback);
        eventTarget.dispatchEvent(expectedEvent);
        // assert
        expect(actualEvent).to.equal(expectedEvent);
      });
      it('removes listener after component unmounts', () => {
        // arrange
        const expectedCallbackCall = false;
        let isCallbackCalled = false;
        const callback = () => {
          isCallbackCalled = true;
        };
        const eventTarget = new EventTarget();
        const eventType: keyof HTMLElementEventMap = 'abort';
        // act
        const { wrapper } = mountWrapper({
          setup: (listener) => listener.startListening(eventTarget, eventType, callback),
        });
        wrapper.unmount();
        eventTarget.dispatchEvent(new CustomEvent(eventType));
        // assert
        expect(isCallbackCalled).to.equal(expectedCallbackCall);
      });
    });
    describe('reference', () => {
      it('immediately adds listener', () => {
        // arrange
        const eventTarget = new EventTarget();
        const eventTargetRef = shallowRef(eventTarget);
        const eventType: keyof HTMLElementEventMap = 'abort';
        const expectedEvent = new CustomEvent(eventType);
        let actualEvent: Event | null = null;
        const callback = (event: Event) => {
          actualEvent = event;
        };
        // act
        const { returnObject } = mountWrapper();
        returnObject.startListening(eventTargetRef, eventType, callback);
        eventTarget.dispatchEvent(expectedEvent);
        // assert
        expect(actualEvent).to.equal(expectedEvent);
      });
      it('adds listener upon reference update', async () => {
        // arrange
        const oldValue = new EventTarget();
        const newValue = new EventTarget();
        const targetRef = shallowRef(oldValue);
        const eventType: keyof HTMLElementEventMap = 'abort';
        const expectedEvent = new CustomEvent(eventType);
        let actualEvent: Event | null = null;
        const callback = (event: Event) => {
          actualEvent = event;
        };
        // act
        const { returnObject } = mountWrapper();
        returnObject.startListening(targetRef, eventType, callback);
        targetRef.value = newValue;
        await nextTick();
        newValue.dispatchEvent(expectedEvent);
        // assert
        expect(actualEvent).to.equal(expectedEvent);
      });
      it('does not throw if initial element is undefined', () => {
        // arrange
        const targetRef = shallowRef(undefined);
        // act
        const { returnObject } = mountWrapper();
        const act = () => {
          returnObject.startListening(targetRef, 'abort', () => { /* NO OP */ });
        };
        // assert
        expect(act).to.not.throw();
      });
      it('does not throw when reference becomes undefined', async () => {
        // arrange
        const targetRef = shallowRef<EventTarget | undefined>(new EventTarget());
        // act
        const { returnObject } = mountWrapper();
        returnObject.startListening(targetRef, 'abort', () => { /* NO OP */ });
        const act = async () => {
          targetRef.value = undefined;
          await nextTick();
        };
        // assert
        await expectDoesNotThrowAsync(act);
      });
      it('removes listener on reference change', async () => {
        // arrange
        const expectedCallbackCall = false;
        let isCallbackCalled = false;
        const callback = () => {
          isCallbackCalled = true;
        };
        const oldValue = new EventTarget();
        const newValue = new EventTarget();
        const targetRef = shallowRef(oldValue);
        const eventType: keyof HTMLElementEventMap = 'abort';
        const expectedEvent = new CustomEvent(eventType);
        // act
        const { returnObject } = mountWrapper();
        returnObject.startListening(targetRef, eventType, callback);
        targetRef.value = newValue;
        await nextTick();
        oldValue.dispatchEvent(expectedEvent);
        // assert
        expect(isCallbackCalled).to.equal(expectedCallbackCall);
      });
      it('removes listener after component unmounts', () => {
        // arrange
        const expectedCallbackCall = false;
        let isCallbackCalled = false;
        const callback = () => {
          isCallbackCalled = true;
        };
        const target = new EventTarget();
        const targetRef = shallowRef(target);
        const eventType: keyof HTMLElementEventMap = 'abort';
        // act
        const { wrapper } = mountWrapper({
          setup: (listener) => listener.startListening(targetRef, eventType, callback),
        });
        wrapper.unmount();
        target.dispatchEvent(new CustomEvent(eventType));
        // assert
        expect(isCallbackCalled).to.equal(expectedCallbackCall);
      });
    });
  });
});

function mountWrapper(options?: {
  readonly constructorArgs?: Parameters<typeof useAutoUnsubscribedEventListener>,
  /** Running inside `setup` allows simulating lifecycle events like unmounting. */
  readonly setup?: (returnObject: ReturnType<typeof useAutoUnsubscribedEventListener>) => void,
}) {
  let returnObject: ReturnType<typeof useAutoUnsubscribedEventListener> | undefined;
  const wrapper = shallowMount({
    setup() {
      returnObject = useAutoUnsubscribedEventListener(...(options?.constructorArgs ?? []));
      if (options?.setup) {
        options.setup(returnObject);
      }
    },
    template: '<div></div>',
  });
  expectExists(returnObject);
  return {
    wrapper,
    returnObject,
  };
}
