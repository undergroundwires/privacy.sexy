import { watch, type Ref, onUnmounted } from 'vue';
import type { LifecycleHook } from '../../Shared/Hooks/Common/LifecycleHook';

export function useGlobalCursor(
  isActive: Readonly<Ref<boolean>>,
  cursorCssValue: string,
  documentAccessor: CursorStyleDomModifier = new GlobalDocumentCursorStyleDomModifier(),
  onTeardown: LifecycleHook = onUnmounted,
) {
  const cursorStyle = createCursorStyle(cursorCssValue, documentAccessor);

  watch(isActive, (isCursorVisible) => {
    if (isCursorVisible) {
      documentAccessor.appendStyleToHead(cursorStyle);
    } else {
      documentAccessor.removeElement(cursorStyle);
    }
  });

  onTeardown(() => {
    documentAccessor.removeElement(cursorStyle);
  });
}

function createCursorStyle(
  cursorCssValue: string,
  documentAccessor: CursorStyleDomModifier,
): HTMLStyleElement {
  // Using `document.body.style.cursor` does not override cursor when hovered on input boxes,
  // buttons etc. so we create a custom style that will do that
  const cursorStyle = documentAccessor.createStyleElement();
  cursorStyle.innerHTML = `*{cursor: ${cursorCssValue}!important;}`;
  return cursorStyle;
}

export interface CursorStyleDomModifier {
  appendStyleToHead(element: HTMLStyleElement): void;
  removeElement(element: HTMLStyleElement): void;
  createStyleElement(): HTMLStyleElement;
}

class GlobalDocumentCursorStyleDomModifier implements CursorStyleDomModifier {
  public appendStyleToHead(element: HTMLStyleElement): void {
    document.head.appendChild(element);
  }

  public removeElement(element: HTMLStyleElement): void {
    element.remove();
  }

  public createStyleElement(): HTMLStyleElement {
    return document.createElement('style');
  }
}
