import { describe, it, expect } from 'vitest';
import { nextTick, shallowRef } from 'vue';
import { useAutoUnsubscribedEventListener } from '@/presentation/components/Shared/Hooks/UseAutoUnsubscribedEventListener';
import { expectDoesNotThrowAsync } from '@tests/shared/Assertions/ExpectThrowsAsync';
import type { LifecycleHook } from '@/presentation/components/Shared/Hooks/Common/LifecycleHook';
import { LifecycleHookStub } from '@tests/unit/shared/Stubs/LifecycleHookStub';

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
        const context = new TestContext();
        // act
        const { startListening } = context.use();
        startListening(eventTarget, eventType, callback);
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
        const teardownHook = new LifecycleHookStub();
        const context = new TestContext()
          .withOnTeardown(teardownHook.getHook());
        // act
        const { startListening } = context.use();
        startListening(eventTarget, eventType, callback);
        teardownHook.executeAllCallbacks();
        eventTarget.dispatchEvent(new CustomEvent(eventType));
        // assert
        expect(teardownHook.totalRegisteredCallbacks).to.greaterThan(0);
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
        const context = new TestContext();
        // act
        const { startListening } = context.use();
        startListening(eventTargetRef, eventType, callback);
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
        const context = new TestContext();
        // act
        const { startListening } = context.use();
        startListening(targetRef, eventType, callback);
        targetRef.value = newValue;
        await nextTick();
        newValue.dispatchEvent(expectedEvent);
        // assert
        expect(actualEvent).to.equal(expectedEvent);
      });
      it('does not throw if initial element is undefined', () => {
        // arrange
        const targetRef = shallowRef(undefined);
        const context = new TestContext();
        // act
        const { startListening } = context.use();
        const act = () => {
          startListening(targetRef, 'abort', () => { /* NO OP */ });
        };
        // assert
        expect(act).to.not.throw();
      });
      it('does not throw when reference becomes undefined', async () => {
        // arrange
        const targetRef = shallowRef<EventTarget | undefined>(new EventTarget());
        const context = new TestContext();
        // act
        const { startListening } = context.use();
        startListening(targetRef, 'abort', () => { /* NO OP */ });
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
        const context = new TestContext();
        // act
        const { startListening } = context.use();
        startListening(targetRef, eventType, callback);
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
        const teardownHook = new LifecycleHookStub();
        const context = new TestContext()
          .withOnTeardown(teardownHook.getHook());
        // act
        const { startListening } = context.use();
        startListening(targetRef, eventType, callback);
        teardownHook.executeAllCallbacks();
        target.dispatchEvent(new CustomEvent(eventType));
        // assert
        expect(isCallbackCalled).to.equal(expectedCallbackCall);
      });
    });
  });
});

class TestContext {
  private onTeardown: LifecycleHook = new LifecycleHookStub()
    .getHook();

  public withOnTeardown(onTeardown: LifecycleHook): this {
    this.onTeardown = onTeardown;
    return this;
  }

  public use(): ReturnType<typeof useAutoUnsubscribedEventListener> {
    return useAutoUnsubscribedEventListener(
      this.onTeardown,
    );
  }
}
