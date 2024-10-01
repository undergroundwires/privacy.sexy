import { shallowRef } from 'vue';
import { useResizeObserver, type ObservedElementReference } from '@/presentation/components/Shared/Hooks/Resize/UseResizeObserver';
import { flushPromiseResolutionQueue } from '@tests/unit/shared/PromiseInspection';
import type { AnimationFrameLimiter } from '@/presentation/components/Shared/Hooks/Resize/UseAnimationFrameLimiter';
import { ThrottleStub } from '@tests/unit/shared/Stubs/ThrottleStub';
import type { LifecycleHook } from '@/presentation/components/Shared/Hooks/Common/LifecycleHook';
import { LifecycleHookStub } from '@tests/unit/shared/Stubs/LifecycleHookStub';

describe('UseResizeObserver', () => {
  it('registers observer once mounted', async () => {
    // arrange
    let registeredElement: Element | null = null;
    const expectedElement = document.createElement('div');
    const resizeObserverStub = createResizeObserverStub();
    resizeObserverStub.observe = (element) => {
      registeredElement = element;
    };
    // act
    new TestContext()
      .withObservedElementRef(shallowRef(expectedElement))
      .withResizeObserver(resizeObserverStub)
      .useResizeObserver();
    await flushPromiseResolutionQueue();
    // assert
    expect(registeredElement).to.equal(expectedElement);
  });
  it('disposes observer once unmounted', async () => {
    // arrange
    let isObserverDisconnected = false;
    const resizeObserverStub = createResizeObserverStub();
    resizeObserverStub.disconnect = () => {
      isObserverDisconnected = true;
    };
    const teardownHook = new LifecycleHookStub();
    // act
    new TestContext()
      .withResizeObserver(resizeObserverStub)
      .withOnTeardown(teardownHook.getHook())
      .useResizeObserver();
    await flushPromiseResolutionQueue();
    teardownHook.executeAllCallbacks();
    // assert
    expect(teardownHook.totalRegisteredCallbacks).to.be.greaterThan(0);
    expect(isObserverDisconnected).to.equal(true);
  });
});

function createResizeObserverStub(): ResizeObserver {
  return {
    disconnect: () => {},
    observe: () => {},
    unobserve: () => {},
  };
}

function createFrameLimiterStub(): AnimationFrameLimiter {
  return {
    cancelNextFrame: () => {},
    resetNextFrame: (callback) => { callback(); },
  };
}

class TestContext {
  private resizeObserver: ResizeObserver = createResizeObserverStub();

  private observedElementRef: ObservedElementReference = shallowRef(document.createElement('div'));

  private onSetup: LifecycleHook = new LifecycleHookStub()
    .withInvokeCallbackImmediately(true)
    .getHook();

  private onTeardown: LifecycleHook = new LifecycleHookStub()
    .getHook();

  public withResizeObserver(resizeObserver: ResizeObserver): this {
    this.resizeObserver = resizeObserver;
    return this;
  }

  public withObservedElementRef(observedElementRef: ObservedElementReference): this {
    this.observedElementRef = observedElementRef;
    return this;
  }

  public withOnSetup(onSetup: LifecycleHook): this {
    this.onSetup = onSetup;
    return this;
  }

  public withOnTeardown(onTeardown: LifecycleHook): this {
    this.onTeardown = onTeardown;
    return this;
  }

  public useResizeObserver() {
    return useResizeObserver(
      ...this.buildParameters(),
    );
  }

  private buildParameters(): Parameters<typeof useResizeObserver> {
    return [
      {
        observedElementRef: this.observedElementRef,
        throttleInMs: 50,
        observeCallback: () => {},
      },
      () => ({
        resizeObserverReady: Promise.resolve(() => this.resizeObserver),
      }),
      () => createFrameLimiterStub(),
      new ThrottleStub()
        .withImmediateExecution(true)
        .func,
      this.onSetup,
      this.onTeardown,
    ];
  }
}
