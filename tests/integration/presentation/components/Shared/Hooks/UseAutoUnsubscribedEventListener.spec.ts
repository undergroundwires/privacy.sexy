import {
  describe, it, expect,
} from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, nextTick, shallowRef } from 'vue';
import { useAutoUnsubscribedEventListener } from '@/presentation/components/Shared/Hooks/UseAutoUnsubscribedEventListener';

describe('UseAutoUnsubscribedEventListener', () => {
  describe('event listening on different targets', () => {
    const testCases: readonly {
      readonly description: string;
      readonly eventTarget: EventTarget;
    }[] = [
      {
        description: 'a div element',
        eventTarget: document.createElement('div'),
      },
      {
        description: 'the document',
        eventTarget: document,
      },
      {
        description: 'the HTML element',
        eventTarget: document.documentElement,
      },
      {
        description: 'the body element',
        eventTarget: document.body,
      },
      {
        description: 'the window',
        eventTarget: window,
      },
    ];
    testCases.forEach((
      { description, eventTarget },
    ) => {
      it(description, () => {
        // arrange
        let actualEvent: Event | undefined;
        const expectedEvent = new KeyboardEvent('keypress');
        const wrapper = mountWrapperComponent(
          ({ startListening }) => {
            startListening(eventTarget, 'keypress', (event) => {
              actualEvent = event;
            });
          },
        );

        try {
          // act
          eventTarget.dispatchEvent(expectedEvent);

          // assert
          expect(actualEvent).to.equal(expectedEvent);
        } finally {
          wrapper.unmount();
        }
        actualEvent = undefined;
        eventTarget.dispatchEvent(new KeyboardEvent('keypress'));
        expect(actualEvent).to.equal(undefined);
      });
    });
  });

  it('moves the listener between reactive targets and stops after unmount', async () => {
    const original = document.createElement('div');
    const replacement = document.createElement('div');
    const target = shallowRef<HTMLElement | undefined>(original);
    const received: Event[] = [];
    const wrapper = mountWrapperComponent(({ startListening }) => {
      startListening(target, 'click', (event) => received.push(event));
    });
    const originalEvent = new MouseEvent('click');
    original.dispatchEvent(originalEvent);
    try {
      target.value = replacement;
      await nextTick();
      original.dispatchEvent(new MouseEvent('click'));
      const replacementEvent = new MouseEvent('click');
      replacement.dispatchEvent(replacementEvent);
      expect(received).to.deep.equal([originalEvent, replacementEvent]);
      target.value = undefined;
      await nextTick();
      replacement.dispatchEvent(new MouseEvent('click'));
      expect(received).to.have.length(2);
    } finally {
      wrapper.unmount();
    }
    target.value = original;
    await nextTick();
    original.dispatchEvent(new MouseEvent('click'));
    replacement.dispatchEvent(new MouseEvent('click'));
    expect(received).to.have.length(2);
  });
});

function mountWrapperComponent(
  callback: (returnObject: ReturnType<typeof useAutoUnsubscribedEventListener>) => void,
) {
  return mount(defineComponent({
    setup() {
      const returnObject = useAutoUnsubscribedEventListener();
      callback(returnObject);
    },
    template: '<div></div>',
  }));
}
