import {
  onUnmounted, ref, shallowReadonly, watch,
} from 'vue';
import { throttle } from '@/application/Common/Timing/Throttle';
import type { Ref } from 'vue';
import type { LifecycleHook } from '../../Shared/Hooks/Common/LifecycleHook';

const ThrottleInMs = 15;

export function useDragHandler(
  draggableElementRef: Readonly<Ref<HTMLElement | undefined>>,
  dragDomModifier: DragDomModifier = new GlobalDocumentDragDomModifier(),
  throttler = throttle,
  onTeardown: LifecycleHook = onUnmounted,
) {
  const displacementX = ref(0);
  const isDragging = ref(false);

  let initialPointerX: number | undefined;

  const onDrag = throttler((event: PointerEvent) => {
    if (initialPointerX === undefined) {
      throw new Error('Resize action started without an initial X coordinate.');
    }
    displacementX.value = event.clientX - initialPointerX;
    initialPointerX = event.clientX;
  }, ThrottleInMs);

  const stopDrag = () => {
    isDragging.value = false;
    dragDomModifier.removeEventListenerFromDocument('pointermove', onDrag);
    dragDomModifier.removeEventListenerFromDocument('pointerup', stopDrag);
  };

  const startDrag = (event: PointerEvent) => {
    isDragging.value = true;
    initialPointerX = event.clientX;
    dragDomModifier.addEventListenerToDocument('pointermove', onDrag);
    dragDomModifier.addEventListenerToDocument('pointerup', stopDrag);
    event.stopPropagation();
    event.preventDefault();
  };

  watch(draggableElementRef, (element) => {
    if (!element) {
      initialPointerX = undefined;
      return;
    }
    initializeElement(element);
  }, { immediate: true });

  function initializeElement(element: HTMLElement) {
    element.style.touchAction = 'none'; // Disable default touch behavior, necessary for resizing functionality to work correctly on touch-enabled devices
    element.addEventListener('pointerdown', startDrag);
  }

  onTeardown(() => {
    stopDrag();
  });

  return {
    displacementX: shallowReadonly(displacementX),
    isDragging: shallowReadonly(isDragging),
  };
}

export interface DragDomModifier {
  addEventListenerToDocument(
    type: keyof DocumentEventMap,
    handler: EventListener,
  ): void;
  removeEventListenerFromDocument(
    type: keyof DocumentEventMap,
    handler: EventListener,
  ): void;
}

class GlobalDocumentDragDomModifier implements DragDomModifier {
  public addEventListenerToDocument(
    type: keyof DocumentEventMap,
    listener: EventListener,
  ): void {
    document.addEventListener(type, listener);
  }

  public removeEventListenerFromDocument(
    type: keyof DocumentEventMap,
    listener: EventListener,
  ): void {
    document.removeEventListener(type, listener);
  }
}
