import { describe, it, expect } from 'vitest';
import { ref, nextTick } from 'vue';
import { useCurrentFocusToggle } from '@/presentation/components/Shared/Modal/Hooks/UseCurrentFocusToggle';

describe('useCurrentFocusToggle', () => {
  describe('initialization', () => {
    it('blurs active element when initialized with disabled focus', async () => {
      // arrange
      const shouldDisableFocus = ref(true);
      const testElement = createElementInBody('input');
      testElement.focus();

      // act
      useCurrentFocusToggle(shouldDisableFocus);
      await nextTick();

      // assert
      expect(!isFocused(testElement));
    });
    it('doesn\'t blur active element when initialized with enabled focus', async () => {
      // arrange
      const isCurrentFocusDisabled = ref(false);
      const testElement = createElementInBody('input');

      // act
      testElement.focus();
      useCurrentFocusToggle(isCurrentFocusDisabled);
      await nextTick();

      // assert
      expect(isFocused(testElement));
    });
  });

  describe('focus toggling', () => {
    it('blurs when focus disabled programmatically', async () => {
      // arrange
      const shouldDisableFocus = ref(false);
      const testElement = createElementInBody('input');
      testElement.focus();

      // act
      useCurrentFocusToggle(shouldDisableFocus);
      shouldDisableFocus.value = true;
      await nextTick();

      // assert
      expect(!isFocused(testElement));
    });

    it('restores focus when re-enabled', async () => {
      // arrange
      const isCurrentFocusDisabled = ref(true);
      const testElement = createElementInBody('input');

      // act
      useCurrentFocusToggle(isCurrentFocusDisabled);
      testElement.focus();
      isCurrentFocusDisabled.value = true;
      await nextTick();
      isCurrentFocusDisabled.value = false;
      await nextTick();

      // assert
      expect(isFocused(testElement));
    });

    it('maintains focus if not disabled', async () => {
      // arrange
      const isCurrentFocusDisabled = ref(false);
      const testElement = createElementInBody('input');

      // act
      testElement.focus();
      useCurrentFocusToggle(isCurrentFocusDisabled);
      isCurrentFocusDisabled.value = false;
      await nextTick();

      // assert
      expect(isFocused(testElement));
    });

    it('handles multiple toggles correctly', async () => {
      // arrange
      const shouldDisableFocus = ref(false);
      const testElement = createElementInBody('input');
      testElement.focus();

      // act
      useCurrentFocusToggle(shouldDisableFocus);
      shouldDisableFocus.value = true;
      await nextTick();
      shouldDisableFocus.value = false;
      await nextTick();
      shouldDisableFocus.value = true;
      await nextTick();

      // assert
      expect(!isFocused(testElement));
    });
  });

  describe('document.body handling', () => {
    it('blurs body when focus is disabled while body is active', async () => {
      // arrange
      document.body.focus();

      const shouldDisableFocus = ref(false);

      // act
      useCurrentFocusToggle(shouldDisableFocus);
      shouldDisableFocus.value = true;
      await nextTick();

      // assert
      expect(!isFocused(document.body));
    });

    it('doesn\'t restore focus to document body once focus is re-enabled', async () => {
      // arrange
      document.body.focus();

      const shouldDisableFocus = ref(false);

      // act
      useCurrentFocusToggle(shouldDisableFocus);
      shouldDisableFocus.value = true;
      await nextTick();
      shouldDisableFocus.value = false;
      await nextTick();

      // assert
      expect(!isFocused(document.body));
    });
  });

  it('handles removal of a previously focused element gracefully', async () => {
    // arrange
    const shouldDisableFocus = ref(true);
    const testElement = createElementInBody('input');
    testElement.focus();

    useCurrentFocusToggle(shouldDisableFocus);
    shouldDisableFocus.value = true;
    await nextTick();
    testElement.remove();
    shouldDisableFocus.value = false;
    await nextTick();

    // assert
    expect(!isFocused(testElement));
  });

  function createElementInBody(tagName: keyof HTMLElementTagNameMap): HTMLElement {
    const element = document.createElement(tagName);
    document.body.appendChild(element);
    return element;
  }
});

function isFocused(element: HTMLElement): boolean {
  return document.activeElement === element;
}
