import {
  describe, it, expect,
} from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';
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
      // `window` target is not working in tests due to how `jsdom` handles it
    ];
    testCases.forEach((
      { description, eventTarget },
    ) => {
      it(description, () => {
        // arrange
        let actualEvent: KeyboardEvent | undefined;
        const expectedEvent = new KeyboardEvent('keypress');
        mountWrapperComponent(
          ({ startListening }) => {
            startListening(eventTarget, 'keypress', (event) => {
              actualEvent = event;
            });
          },
        );

        // act
        eventTarget.dispatchEvent(expectedEvent);

        // assert
        expect(actualEvent).to.equal(expectedEvent);
      });
    });
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
