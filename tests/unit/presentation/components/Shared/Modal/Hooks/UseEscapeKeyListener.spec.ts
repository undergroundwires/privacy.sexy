import { describe, it, expect } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { nextTick, defineComponent } from 'vue';
import { useEscapeKeyListener } from '@/presentation/components/Shared/Modal/Hooks/UseEscapeKeyListener';

describe('useEscapeKeyListener', () => {
  it('executes the callback when the Escape key is pressed', async () => {
    // arrange
    let callbackCalled = false;
    const callback = () => {
      callbackCalled = true;
    };
    createComponent(callback);

    // act
    const event = new KeyboardEvent('keyup', { key: 'Escape' });
    window.dispatchEvent(event);
    await nextTick();

    // assert
    expect(callbackCalled).to.equal(true);
  });

  it('does not execute the callback for other key presses', async () => {
    // arrange
    let callbackCalled = false;
    const callback = () => {
      callbackCalled = true;
    };
    createComponent(callback);

    // act
    const event = new KeyboardEvent('keyup', { key: 'Enter' });
    window.dispatchEvent(event);
    await nextTick();

    // assert
    expect(callbackCalled).to.equal(false);
  });

  it('adds an event listener on component mount', () => {
    // arrange
    const { restore, isAddEventCalled } = createWindowEventSpies();

    // act
    createComponent();

    // assert
    expect(isAddEventCalled()).to.equal(true);
    restore();
  });

  it('removes the event listener on component unmount', async () => {
    // arrange
    const { restore, isRemoveEventCalled } = createWindowEventSpies();

    // act
    const wrapper = createComponent();
    wrapper.unmount();
    await nextTick();

    // assert
    expect(isRemoveEventCalled()).to.equal(true);
    restore();
  });
});

function createComponent(callback = () => {}) {
  return shallowMount(defineComponent({
    setup() {
      useEscapeKeyListener(callback);
    },
    template: '<div></div>',
  }));
}

function createWindowEventSpies() {
  let addEventCalled = false;
  let removeEventCalled = false;

  const originalAddEventListener = window.addEventListener;
  const originalRemoveEventListener = window.removeEventListener;

  window.addEventListener = (
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ): void => {
    if (type === 'keyup' && typeof listener === 'function') {
      addEventCalled = true;
    }
    originalAddEventListener(type, listener, options);
  };

  window.removeEventListener = (
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions,
  ): void => {
    if (type === 'keyup' && typeof listener === 'function') {
      removeEventCalled = true;
    }
    originalRemoveEventListener(type, listener, options);
  };

  return {
    restore: () => {
      window.addEventListener = originalAddEventListener;
      window.removeEventListener = originalRemoveEventListener;
    },
    isAddEventCalled() {
      return addEventCalled;
    },
    isRemoveEventCalled() {
      return removeEventCalled;
    },
  };
}
