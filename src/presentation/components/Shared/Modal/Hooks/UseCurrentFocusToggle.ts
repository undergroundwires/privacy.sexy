import { Ref, watchEffect } from 'vue';

/**
 * Manages focus transitions, ensuring good usability and accessibility.
 */
export function useCurrentFocusToggle(shouldDisableFocus: Ref<boolean>) {
  let previouslyFocusedElement: HTMLElement | undefined;

  watchEffect(() => {
    if (shouldDisableFocus.value) {
      previouslyFocusedElement = document.activeElement as HTMLElement | null;
      previouslyFocusedElement?.blur();
    } else {
      if (!previouslyFocusedElement || previouslyFocusedElement.tagName === 'BODY') {
        // It doesn't make sense to return focus to the body after the modal is
        // closed because the body itself doesn't offer meaningful interactivity
        return;
      }
      previouslyFocusedElement.focus();
      previouslyFocusedElement = undefined;
    }
  });
}
