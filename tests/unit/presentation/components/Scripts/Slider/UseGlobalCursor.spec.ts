import { it, describe, expect } from 'vitest';
import {
  type Ref, ref, nextTick,
} from 'vue';
import { type CursorStyleDomModifier, useGlobalCursor } from '@/presentation/components/Scripts/Slider/UseGlobalCursor';
import type { LifecycleHook } from '@/presentation/components/Shared/Hooks/Common/LifecycleHook';
import { LifecycleHookStub } from '@tests/unit/shared/Stubs/LifecycleHookStub';

describe('useGlobalCursor', () => {
  it('adds cursor style to head on activation', async () => {
    // arrange
    const expectedCursorCssStyleValue = 'pointer';
    const isActive = ref(false);
    const domModifier = new CursorStyleDomModifierStub();

    // act
    createHookWithStubs({ isActive, domModifier });
    isActive.value = true;
    await nextTick();

    // assert
    const { elementsAppendedToHead: appendedElements } = domModifier;
    expect(appendedElements.length).to.equal(1);
    expect(appendedElements[0].innerHTML).toContain(expectedCursorCssStyleValue);
  });

  it('removes cursor style from head on deactivation', async () => {
    // arrange
    const isActive = ref(true);
    const domModifier = new CursorStyleDomModifierStub();

    // act
    createHookWithStubs({ isActive, domModifier });
    await nextTick();
    isActive.value = false;
    await nextTick();

    // assert
    expect(domModifier.elementsRemovedFromHead.length).to.equal(1);
  });

  it('cleans up cursor style on unmount', async () => {
    // arrange
    const isActive = ref(true);
    const domModifier = new CursorStyleDomModifierStub();
    const onTeardown = new LifecycleHookStub();

    // act
    createHookWithStubs({ isActive, domModifier, onTeardown: onTeardown.getHook() });
    onTeardown.executeAllCallbacks();
    await nextTick();

    // assert
    expect(onTeardown.totalRegisteredCallbacks).to.be.greaterThan(0);
    expect(domModifier.elementsRemovedFromHead.length).to.equal(1);
  });

  it('does not append style to head when initially inactive', async () => {
    // arrange
    const isActive = ref(false);
    const domModifier = new CursorStyleDomModifierStub();

    // act
    createHookWithStubs({ isActive, domModifier });
    await nextTick();

    // assert
    expect(domModifier.elementsAppendedToHead.length).toBe(0);
  });
});

function createHookWithStubs(options?: {
  readonly isActive?: Ref<boolean>;
  readonly expectedCursorCssStyleValue?: string;
  readonly domModifier?: CursorStyleDomModifier;
  readonly onTeardown?: LifecycleHook;
}) {
  const hookResult = useGlobalCursor(
    options?.isActive ?? ref(true),
    options?.expectedCursorCssStyleValue ?? 'pointer',
    options?.domModifier ?? new CursorStyleDomModifierStub(),
    options?.onTeardown ?? new LifecycleHookStub().getHook(),
  );
  return {
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
