import { shallowMount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import { type Ref, nextTick, ref } from 'vue';
import CardList from '@/presentation/components/Scripts/View/Cards/CardList.vue';
import { useCollectionState } from '@/presentation/components/Shared/Hooks/UseCollectionState';
import { UseCollectionStateStub } from '@tests/unit/shared/Stubs/UseCollectionStateStub';
import { InjectionKeys } from '@/presentation/injectionSymbols';
import { createSizeObserverStub } from '@tests/unit/shared/Stubs/SizeObserverStub';
import { UseEventListenerStub } from '@tests/unit/shared/Stubs/UseEventListenerStub';

const DOM_SELECTOR_CARDS = '.cards';

describe('CardList.vue', () => {
  describe('rendering cards based on width', () => {
    it('renders cards when a valid width is provided', async () => {
      // arrange
      const expectedCardsExistence = true;
      const width = ref(0);
      // act
      const wrapper = mountComponent({
        widthRef: width,
      });
      width.value = 800;
      await nextTick();
      // assert
      const actual = wrapper.find(DOM_SELECTOR_CARDS).exists();
      expect(actual).to.equal(expectedCardsExistence, wrapper.html());
    });
    it('does not render cards when width is not set', async () => {
      // arrange
      const expectedCardsExistence = false;
      const width = ref(0);
      const wrapper = mountComponent({
        widthRef: width,
      });
      // act
      await nextTick();
      // assert
      const actual = wrapper.find(DOM_SELECTOR_CARDS).exists();
      expect(actual).to.equal(expectedCardsExistence, wrapper.html());
    });
  });
});

function mountComponent(options?: {
  readonly useCollectionState?: ReturnType<typeof useCollectionState>,
  readonly widthRef?: Readonly<Ref<number>>,
}) {
  const {
    name: sizeObserverName,
    component: sizeObserverStub,
  } = createSizeObserverStub(options?.widthRef);
  return shallowMount(CardList, {
    global: {
      provide: {
        [InjectionKeys.useCollectionState.key]:
          () => options?.useCollectionState ?? new UseCollectionStateStub().get(),
        [InjectionKeys.useAutoUnsubscribedEventListener.key]: new UseEventListenerStub().get(),
      },
      stubs: {
        [sizeObserverName]: sizeObserverStub,
      },
    },
  });
}
