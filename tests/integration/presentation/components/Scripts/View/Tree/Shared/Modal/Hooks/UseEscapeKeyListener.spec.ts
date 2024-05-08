import {
  describe, it, expect,
} from 'vitest';
import { defineComponent } from 'vue';
import { mount } from '@vue/test-utils';
import { createEventSpies } from '@tests/shared/Spies/EventTargetSpy';
import { useEscapeKeyListener } from '@/presentation/components/Shared/Modal/Hooks/UseEscapeKeyListener';
import { formatAssertionMessage } from '@tests/shared/FormatAssertionMessage';

const EventSource: EventTarget = document;
type EventName = keyof DocumentEventMap;

describe('UseEscapeKeyListener', () => {
  it('executes the callback when the Escape key is pressed', () => {
    // arrange
    const expectedCallbackCall = true;
    let callbackCalled = false;
    const callback = () => {
      callbackCalled = true;
    };

    // act
    mountWrapperComponent(callback);
    const event = new KeyboardEvent('keyup', { key: 'Escape' });
    EventSource.dispatchEvent(event);

    // assert
    expect(callbackCalled).to.equal(expectedCallbackCall);
  });

  it('adds the event listener on component mount', () => {
    // arrange
    const expectedEventType: EventName = 'keyup';
    const { isAddEventCalled, formatListeners } = createEventSpies(EventSource, afterEach);

    // act
    mountWrapperComponent();

    // assert
    const isAdded = isAddEventCalled(expectedEventType);
    expect(isAdded).to.equal(true, formatAssertionMessage([
      `Expected event type to be added: "${expectedEventType}".`,
      `Current listeners: ${formatListeners()}`,
    ]));
  });

  it('removes the event listener once unmounted', () => {
    // arrange
    const expectedEventType: EventName = 'keyup';
    const { isRemoveEventCalled, formatListeners } = createEventSpies(EventSource, afterEach);

    // act
    const wrapper = mountWrapperComponent();
    wrapper.unmount();

    // assert
    const isRemoved = isRemoveEventCalled(expectedEventType);
    expect(isRemoved).to.equal(true, formatAssertionMessage([
      `Expected event type to be removed: "${expectedEventType}".`,
      `Remaining listeners: ${formatListeners()}`,
    ]));
  });
});

function mountWrapperComponent(
  callback = () => {},
) {
  return mount(defineComponent({
    setup() {
      useEscapeKeyListener(callback);
    },
    template: '<div></div>',
  }));
}
