import { describe, it, expect } from 'vitest';
import { ref, type Ref } from 'vue';
import { useDragHandler, type DragDomModifier } from '@/presentation/components/Scripts/Slider/UseDragHandler';
import { ThrottleStub } from '@tests/unit/shared/Stubs/ThrottleStub';
import { throttle } from '@/application/Common/Timing/Throttle';
import type { ConstructorArguments } from '@/TypeHelpers';

describe('useDragHandler', () => {
  describe('initially', () => {
    it('sets displacement X to 0', () => {
      // arrange
      const expectedValue = 0;

      // act
      const { displacementX } = initializeDragHandlerWithMocks();

      // assert
      expect(displacementX.value).to.equal(expectedValue);
    });
    it('sets dragging state to false', () => {
      // arrange
      const expectedValue = false;

      // act
      const { isDragging } = initializeDragHandlerWithMocks();

      // assert
      expect(isDragging.value).to.equal(expectedValue);
    });
    it('disables element touch action', () => {
      // arrange
      const expectedTouchAction = 'none';
      const mockElement = document.createElement('div');

      // act
      initializeDragHandlerWithMocks({
        draggableElementRef: ref(mockElement),
      });

      // assert
      const actualTouchAction = mockElement.style.touchAction;
      expect(actualTouchAction).to.equal(expectedTouchAction);
    });
    it('attaches event listener for drag start', () => {
      // arrange
      const expectedEventName: keyof HTMLElementEventMap = 'pointerdown';
      let actualEventName: keyof HTMLElementEventMap | undefined;
      const mockElement = document.createElement('div');
      mockElement.addEventListener = (eventName: keyof HTMLElementEventMap) => {
        actualEventName = eventName;
      };

      // act
      initializeDragHandlerWithMocks({
        draggableElementRef: ref(mockElement),
      });

      // assert
      expect(expectedEventName).to.equal(actualEventName);
    });
  });
  describe('on drag', () => {
    it('activates dragging on start of drag', () => {
      // arrange
      const expectedDragState = true;
      const mockElement = document.createElement('div');

      // act
      const { isDragging } = initializeDragHandlerWithMocks({
        draggableElementRef: ref(mockElement),
      });
      mockElement.dispatchEvent(createMockPointerEvent('pointerdown', { clientX: 100 }));

      // assert
      expect(isDragging.value).to.equal(expectedDragState);
    });
    it('updates displacement during dragging', () => {
      // arrange
      const initialDragX = 100;
      const finalDragX = 150;
      const expectedDisplacementX = finalDragX - initialDragX;
      const mockElement = document.createElement('div');
      const dragDomModifierMock = new DragDomModifierMock();

      // act
      const { displacementX } = initializeDragHandlerWithMocks({
        draggableElementRef: ref(mockElement),
        dragDomModifier: dragDomModifierMock,
      });
      mockElement.dispatchEvent(createMockPointerEvent('pointerdown', { clientX: 100 }));
      dragDomModifierMock.simulateEvent('pointermove', createMockPointerEvent('pointermove', { clientX: finalDragX }));

      // assert
      expect(displacementX.value).to.equal(expectedDisplacementX);
    });
    it('attaches event listeners', () => {
      // arrange
      const expectedEventNames: ReadonlyArray<keyof HTMLElementEventMap> = [
        'pointerup',
        'pointermove',
      ];
      const mockElement = document.createElement('div');
      const dragDomModifierMock = new DragDomModifierMock();

      // act
      initializeDragHandlerWithMocks({
        draggableElementRef: ref(mockElement),
        dragDomModifier: dragDomModifierMock,
      });
      mockElement.dispatchEvent(createMockPointerEvent('pointerdown', { clientX: 100 }));

      // assert
      const actualEventNames = [...dragDomModifierMock.events].map(([eventName]) => eventName);
      expect(expectedEventNames).to.have.lengthOf(actualEventNames.length);
      expect(expectedEventNames).to.have.members(actualEventNames);
    });
    describe('throttling', () => {
      it('initializes event throttling', () => {
        // arrange
        const throttleStub = new ThrottleStub()
          .withImmediateExecution(false);
        const mockElement = document.createElement('div');

        // act
        initializeDragHandlerWithMocks({
          draggableElementRef: ref(mockElement),
          throttler: throttleStub.func,
        });

        // assert
        expect(throttleStub.throttleInitializationCallArgs.length).to.equal(1);
      });
      it('sets a specific throttle time interval', () => {
        // arrange
        const expectedThrottleInMs = 15;
        const throttleStub = new ThrottleStub()
          .withImmediateExecution(false);
        const mockElement = document.createElement('div');

        // act
        initializeDragHandlerWithMocks({
          draggableElementRef: ref(mockElement),
          throttler: throttleStub.func,
        });

        // assert
        expect(throttleStub.throttleInitializationCallArgs.length).to.equal(1);
        const [, actualThrottleInMs] = throttleStub.throttleInitializationCallArgs[0];
        expect(expectedThrottleInMs).to.equal(actualThrottleInMs);
      });
      it('limits frequency of drag movement updates', () => {
        // arrange
        const expectedTotalThrottledEvents = 3;
        const throttleStub = new ThrottleStub();
        const mockElement = document.createElement('div');
        const dragDomModifierMock = new DragDomModifierMock();

        // act
        initializeDragHandlerWithMocks({
          draggableElementRef: ref(mockElement),
          throttler: throttleStub.func,
          dragDomModifier: dragDomModifierMock,
        });
        mockElement.dispatchEvent(createMockPointerEvent('pointerdown', { clientX: 100 }));
        for (let i = 0; i < expectedTotalThrottledEvents; i++) {
          dragDomModifierMock.simulateEvent('pointermove', createMockPointerEvent('pointermove', { clientX: 110 }));
        }

        // assert
        const actualTotalThrottledEvents = throttleStub.throttledFunctionCallArgs.length;
        expect(actualTotalThrottledEvents).to.equal(expectedTotalThrottledEvents);
      });
      it('calculates displacement considering throttling', () => {
        // arrange
        const throttleStub = new ThrottleStub().withImmediateExecution(true);
        const mockElement = document.createElement('div');
        const initialDragX = 100;
        const firstDisplacementX = 10;
        const dragDomModifierMock = new DragDomModifierMock();

        // act
        const { displacementX } = initializeDragHandlerWithMocks({
          draggableElementRef: ref(mockElement),
          throttler: throttleStub.func,
          dragDomModifier: dragDomModifierMock,
        });
        mockElement.dispatchEvent(createMockPointerEvent('pointerdown', { clientX: initialDragX }));
        dragDomModifierMock.simulateEvent('pointermove', createMockPointerEvent('pointermove', { clientX: initialDragX - firstDisplacementX }));
        dragDomModifierMock.simulateEvent('pointermove', createMockPointerEvent('pointermove', { clientX: initialDragX - firstDisplacementX * 2 }));
        throttleStub.executeFirst();

        // assert
        expect(displacementX.value).to.equal(firstDisplacementX);
      });
    });
  });
  describe('on drag end', () => {
    it('deactivates dragging on drag end', () => {
      // arrange
      const expectedDraggingState = false;
      const mockElement = document.createElement('div');
      const dragDomModifierMock = new DragDomModifierMock();

      // act
      const { isDragging } = initializeDragHandlerWithMocks({
        draggableElementRef: ref(mockElement),
        dragDomModifier: dragDomModifierMock,
      });
      mockElement.dispatchEvent(createMockPointerEvent('pointerdown', { clientX: 100 }));
      dragDomModifierMock.simulateEvent('pointerup', createMockPointerEvent('pointerup'));

      // assert
      expect(isDragging.value).to.equal(expectedDraggingState);
    });
    it('removes event listeners', () => {
      // arrange
      const mockElement = document.createElement('div');
      const dragDomModifierMock = new DragDomModifierMock();

      // act
      initializeDragHandlerWithMocks({
        draggableElementRef: ref(mockElement),
        dragDomModifier: dragDomModifierMock,
      });
      mockElement.dispatchEvent(createMockPointerEvent('pointerdown', { clientX: 100 }));
      dragDomModifierMock.simulateEvent('pointerup', createMockPointerEvent('pointerup'));

      // assert
      const actualEvents = [...dragDomModifierMock.events];
      expect(actualEvents).to.have.lengthOf(0);
    });
  });
});

function initializeDragHandlerWithMocks(mocks?: {
  readonly dragDomModifier?: DragDomModifier;
  readonly draggableElementRef?: Ref<HTMLElement>;
  readonly throttler?: typeof throttle,
}) {
  return useDragHandler(
    mocks?.draggableElementRef ?? ref(document.createElement('div')),
    mocks?.dragDomModifier ?? new DragDomModifierMock(),
    mocks?.throttler ?? new ThrottleStub().withImmediateExecution(true).func,
  );
}

function createMockPointerEvent(...args: ConstructorArguments<typeof PointerEvent>): PointerEvent {
  return new MouseEvent(...args) as PointerEvent; // jsdom does not support `PointerEvent` constructor, https://github.com/jsdom/jsdom/issues/2527
}

class DragDomModifierMock implements DragDomModifier {
  public events = new Map<keyof DocumentEventMap, EventListener>();

  public addEventListenerToDocument(type: keyof DocumentEventMap, handler: EventListener): void {
    this.events.set(type, handler);
  }

  public removeEventListenerFromDocument(type: keyof DocumentEventMap): void {
    this.events.delete(type);
  }

  public simulateEvent(type: keyof DocumentEventMap, event: Event) {
    const handler = this.events.get(type);
    if (!handler) {
      throw new Error(`No event handler registered for: ${type}`);
    }
    handler(event);
  }
}
