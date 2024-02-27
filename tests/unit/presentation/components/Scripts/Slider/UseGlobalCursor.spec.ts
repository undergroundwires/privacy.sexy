import { it, describe, expect } from 'vitest';
import {
  type Ref, ref, defineComponent, nextTick,
} from 'vue';
import { shallowMount } from '@vue/test-utils';
import { type CursorStyleDomModifier, useGlobalCursor } from '@/presentation/components/Scripts/Slider/UseGlobalCursor';

describe('useGlobalCursor', () => {
  it('adds cursor style to head on activation', async () => {
    // arrange
    const expectedCursorCssStyleValue = 'pointer';
    const isActive = ref(false);

    // act
    const { cursorStyleDomModifierMock } = createHookWithStubs({ isActive });
    isActive.value = true;
    await nextTick();

    // assert
    const { elementsAppendedToHead: appendedElements } = cursorStyleDomModifierMock;
    expect(appendedElements.length).to.equal(1);
    expect(appendedElements[0].innerHTML).toContain(expectedCursorCssStyleValue);
  });

  it('removes cursor style from head on deactivation', async () => {
    // arrange
    const isActive = ref(true);

    // act
    const { cursorStyleDomModifierMock } = createHookWithStubs({ isActive });
    await nextTick();
    isActive.value = false;
    await nextTick();

    // assert
    expect(cursorStyleDomModifierMock.elementsRemovedFromHead.length).to.equal(1);
  });

  it('cleans up cursor style on unmount', async () => {
    // arrange
    const isActive = ref(true);

    // act
    const { wrapper, returnObject } = mountWrapperComponent({ isActive });
    wrapper.unmount();
    await nextTick();

    // assert
    const { cursorStyleDomModifierMock } = returnObject;
    expect(cursorStyleDomModifierMock.elementsRemovedFromHead.length).to.equal(1);
  });

  it('does not append style to head when initially inactive', async () => {
    // arrange
    const isActive = ref(false);

    // act
    const { cursorStyleDomModifierMock } = createHookWithStubs({ isActive });
    await nextTick();

    // assert
    expect(cursorStyleDomModifierMock.elementsAppendedToHead.length).toBe(0);
  });
});

function mountWrapperComponent(...hookOptions: Parameters<typeof createHookWithStubs>) {
  let returnObject: ReturnType<typeof createHookWithStubs> | undefined;
  const wrapper = shallowMount(
    defineComponent({
      setup() {
        returnObject = createHookWithStubs(...hookOptions);
      },
      template: '<div></div>',
    }),
  );
  if (!returnObject) {
    throw new Error('missing hook result');
  }
  return {
    wrapper,
    returnObject,
  };
}

function createHookWithStubs(options?: {
  readonly isActive?: Ref<boolean>;
  readonly expectedCursorCssStyleValue?: string;
}) {
  const cursorStyleDomModifierMock = new CursorStyleDomModifierStub();
  const hookResult = useGlobalCursor(
    options?.isActive ?? ref(true),
    options?.expectedCursorCssStyleValue ?? 'pointer',
    cursorStyleDomModifierMock,
  );
  return {
    cursorStyleDomModifierMock,
    hookResult,
  };
}

class CursorStyleDomModifierStub implements CursorStyleDomModifier {
  public elementsAppendedToHead: HTMLStyleElement[] = [];

  public elementsRemovedFromHead: HTMLStyleElement[] = [];

  public appendStyleToHead(element: HTMLStyleElement): void {
    this.elementsAppendedToHead.push(element);
  }

  public removeElement(element: HTMLStyleElement): void {
    this.elementsRemovedFromHead.push(element);
  }

  public createStyleElement(): HTMLStyleElement {
    const element = document.createElement('style');
    return element;
  }
}
