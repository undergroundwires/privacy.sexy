import {
  describe, it, expect, afterEach,
} from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { nextTick, defineComponent } from 'vue';
import { useEscapeKeyListener } from '@/presentation/components/Shared/Modal/Hooks/UseEscapeKeyListener';
import { type EventName, createWindowEventSpies } from '@tests/shared/Spies/WindowEventSpies';

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
    const expectedEventType: EventName = 'keyup';
    const { isAddEventCalled } = createWindowEventSpies(afterEach);

    // act
    createComponent();

    // assert
    expect(isAddEventCalled(expectedEventType)).to.equal(true);
  });

  it('removes the event listener on component unmount', async () => {
    // arrange
    const expectedEventType: EventName = 'keyup';
    const { isRemoveEventCalled } = createWindowEventSpies(afterEach);

    // act
    const wrapper = createComponent();
    wrapper.unmount();
    await nextTick();

    // assert
    expect(isRemoveEventCalled(expectedEventType)).to.equal(true);
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
