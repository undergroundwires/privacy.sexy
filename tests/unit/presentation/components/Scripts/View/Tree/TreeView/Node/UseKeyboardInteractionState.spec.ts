import { describe, it, expect } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { defineComponent, nextTick } from 'vue';
import {
  type WindowWithEventListeners, useKeyboardInteractionState,
} from '@/presentation/components/Scripts/View/Tree/TreeView/Node/UseKeyboardInteractionState';

describe('useKeyboardInteractionState', () => {
  describe('isKeyboardBeingUsed', () => {
    it('should initialize as `false`', () => {
      // arrange
      const { windowStub } = createWindowStub();
      // act
      const { returnObject } = mountWrapperComponent(windowStub);
      // assert
      expect(returnObject.isKeyboardBeingUsed.value).to.equal(false);
    });

    it('should set to `true` on keydown event', () => {
      // arrange
      const { triggerEvent, windowStub } = createWindowStub();
      // act
      const { returnObject } = mountWrapperComponent(windowStub);
      triggerEvent('keydown');
      // assert
      expect(returnObject.isKeyboardBeingUsed.value).to.equal(true);
    });

    it('should stay `false` on click event', () => {
      // arrange
      const { triggerEvent, windowStub } = createWindowStub();
      // act
      const { returnObject } = mountWrapperComponent(windowStub);
      triggerEvent('click');
      // assert
      expect(returnObject.isKeyboardBeingUsed.value).to.equal(false);
    });

    it('should transition to `false` on click event after keydown event', () => {
      // arrange
      const { triggerEvent, windowStub } = createWindowStub();
      // act
      const { returnObject } = mountWrapperComponent(windowStub);
      triggerEvent('keydown');
      triggerEvent('click');
      // assert
      expect(returnObject.isKeyboardBeingUsed.value).to.equal(false);
    });
  });

  describe('attach/detach', () => {
    it('should attach keydown and click events on mounted', () => {
      // arrange
      const { listeners, windowStub } = createWindowStub();
      // act
      mountWrapperComponent(windowStub);
      // assert
      expect(listeners.keydown).to.have.lengthOf(1);
      expect(listeners.click).to.have.lengthOf(1);
    });

    it('should detach keydown and click events on unmounted', async () => {
      // arrange
      const { listeners, windowStub } = createWindowStub();
      // act
      const { wrapper } = mountWrapperComponent(windowStub);
      wrapper.unmount();
      await nextTick();
      // assert
      expect(listeners.keydown).to.have.lengthOf(0);
      expect(listeners.click).to.have.lengthOf(0);
    });
  });
});

function mountWrapperComponent(window: WindowWithEventListeners) {
  let returnObject: ReturnType<typeof useKeyboardInteractionState> | undefined;
  const wrapper = shallowMount(defineComponent({
    setup() {
      returnObject = useKeyboardInteractionState(window);
    },
    template: '<div></div>',
  }));
  if (!returnObject) {
    throw new Error('missing hook result');
  }
  return {
    returnObject,
    wrapper,
  };
}

type EventListenerWindowFunction = (ev: Event) => unknown;
type WindowEventKey = keyof WindowEventMap;

function createWindowStub() {
  const listeners: Partial<Record<WindowEventKey, EventListenerWindowFunction[]>> = {};
  const windowStub: WindowWithEventListeners = {
    addEventListener: (eventName: string, fn: EventListenerWindowFunction) => {
      if (!listeners[eventName]) {
        listeners[eventName] = [];
      }
      listeners[eventName].push(fn);
    },
    removeEventListener: (eventName: string, fn: EventListenerWindowFunction) => {
      if (!listeners[eventName]) return;
      const index = listeners[eventName].indexOf(fn);
      if (index > -1) {
        listeners[eventName].splice(index, 1);
      }
    },
  };
  return {
    windowStub,
    triggerEvent: (eventName: WindowEventKey) => {
      listeners[eventName]?.forEach((fn) => fn(new Event(eventName)));
    },
    listeners,
  };
}
