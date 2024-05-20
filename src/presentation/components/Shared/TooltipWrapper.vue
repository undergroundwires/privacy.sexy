<template>
  <div class="tooltip">
    <!--
      Both trigger and tooltip elements are grouped within a single parent for accurate positioning.
      It allows the tooltip content to calculate its position based on the trigger's location.
    -->
    <div
      ref="triggeringElement"
      class="tooltip__trigger"
    >
      <slot />
    </div>
    <div class="tooltip__overlay">
      <div
        ref="tooltipDisplayElement"
        class="tooltip__display"
        :style="displayStyles"
      >
        <div class="tooltip__content">
          <slot name="tooltip" />
        </div>
        <div
          ref="arrowElement"
          class="tooltip__arrow"
          :style="arrowStyles"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  useFloating, arrow, shift, flip, type Placement, offset, type Side, type Coords, autoUpdate,
} from '@floating-ui/vue';
import { defineComponent, shallowRef, computed } from 'vue';
import { useResizeObserverPolyfill } from '@/presentation/components/Shared/Hooks/Resize/UseResizeObserverPolyfill';
import { throttle } from '@/application/Common/Timing/Throttle';
import { type TargetEventListener } from '@/presentation/components/Shared/Hooks/UseAutoUnsubscribedEventListener';
import { injectKey } from '@/presentation/injectionSymbols';
import type { CSSProperties } from 'vue';

const GAP_BETWEEN_TOOLTIP_AND_TRIGGER_IN_PX = 2;
const ARROW_SIZE_IN_PX = 4;

const DEFAULT_PLACEMENT: Placement = 'top';

export default defineComponent({
  setup() {
    const tooltipDisplayElement = shallowRef<HTMLElement | undefined>();
    const triggeringElement = shallowRef<HTMLElement | undefined>();
    const arrowElement = shallowRef<HTMLElement | undefined>();

    const eventListener = injectKey((keys) => keys.useAutoUnsubscribedEventListener);
    useResizeObserverPolyfill();

    const {
      floatingStyles, middlewareData, placement, update,
    } = useFloating(
      triggeringElement,
      tooltipDisplayElement,
      {
        placement: DEFAULT_PLACEMENT,
        middleware: [
          offset(ARROW_SIZE_IN_PX + GAP_BETWEEN_TOOLTIP_AND_TRIGGER_IN_PX),
          /* Shifts the element along the specified axes in order to keep it in view. */
          shift(),
          /*  Changes the placement of the floating element in order to keep it in view,
              with the ability to flip to any placement. */
          flip(),
          arrow({ element: arrowElement }),
        ],
        whileElementsMounted: autoUpdate,
      },
    );

    /*
      Not using `float-ui`'s `autoUpdate` with `animationFrame: true` because it updates tooltips on
      every frame through `requestAnimationFrame`. This behavior is analogous to a continuous loop
      (often 60 updates per second and more depending on the refresh rate), which can be excessively
      performance-intensive. It's overkill for the application needs and a monkey solution due to
      its brute-force nature.
    */
    setupTransitionEndEvents(throttle(() => {
      update();
    }, 400, { excludeLeadingCall: true }), eventListener);

    const arrowStyles = computed<CSSProperties>(() => {
      if (!middlewareData.value.arrow) {
        return {
          display: 'none',
        };
      }
      return {
        ...getArrowPositionStyles(middlewareData.value.arrow, placement.value),
        ...getArrowAppearanceStyles(),
      };
    });

    return {
      tooltipDisplayElement,
      triggeringElement,
      displayStyles: floatingStyles,
      arrowStyles,
      arrowElement,
      placement,
    };
  },
});

function getArrowAppearanceStyles(): CSSProperties {
  return {
    width: `${ARROW_SIZE_IN_PX * 2}px`,
    height: `${ARROW_SIZE_IN_PX * 2}px`,
    rotate: '45deg',
  };
}

function getArrowPositionStyles(
  coordinations: Partial<Coords>,
  placement: Placement,
): CSSProperties {
  const style: CSSProperties = {};
  style.position = 'absolute';
  const { x, y } = coordinations;
  if (x) {
    style.left = `${x}px`;
  } else if (y) { // either X or Y is calculated
    style.top = `${y}px`;
  }
  const oppositeSide = getCounterpartBoxOffsetProperty(placement);
  style[oppositeSide.toString()] = `-${ARROW_SIZE_IN_PX}px`;
  return style;
}

function getCounterpartBoxOffsetProperty(placement: Placement): keyof CSSProperties {
  const sideCounterparts: Record<Side, keyof CSSProperties> = {
    top: 'bottom',
    right: 'left',
    bottom: 'top',
    left: 'right',
  };
  const currentSide = placement.split('-')[0] as Side;
  return sideCounterparts[currentSide];
}

function setupTransitionEndEvents(
  handler: () => void,
  listener: TargetEventListener,
) {
  const transitionEndEvents: readonly (keyof HTMLElementEventMap)[] = [
    'transitionend',
    'transitioncancel',
  ];
  transitionEndEvents.forEach((eventName) => {
    listener.startListening(document.body, eventName, handler);
  });
}
</script>

<style scoped lang="scss">
@use "@/presentation/assets/styles/main" as *;

$color-tooltip-background: $color-primary-darkest;

.tooltip {
  display: inline-flex;
}

@mixin set-visibility($isVisible: true) {
  /*
    Visibility is controlled through CSS rather than JavaScript. This allows better CSS
    consistency by reusing `hover-or-touch` mixin. Using vue directives such as `v-if` and
    `v-show` require JavaScript tracking of touch/hover without reuse of `hover-or-touch`.
    The `visibility` property is toggled because:
      - Using the `display` property doesn't support smooth transitions (e.g., fading out).
      - Keeping invisible tooltips in the DOM is a best practice for accessibility (screen readers).
  */
  $animation-duration: 0.5s;
  transition: opacity $animation-duration, visibility $animation-duration;
  @if $isVisible {
    visibility: visible;
    opacity: 1;
  } @else {
    visibility: hidden;
    opacity: 0;
  }
}

@mixin fixed-fullscreen {
  /*
    This mixin removes the element from the normal document flow, ensuring that it does not disrupt the layout of other elements,
    such as causing unintended screen width expansion on smaller mobile screens.

    Setting `top`, `left`, `width` and `height` ensures that, the tooltip is prepared to cover the entire viewport, preventing it from
    being cropped or causing overflow issues. `pointer-events: none;` disables capturing all events on page.

    Other positioning alternatives considered:
    - Moving tooltip off the screen using `left` and `top` properties:
      - Causes unintended screen width expansion on smaller mobile screens.
      - Causes screen shaking on Chromium browsers.
    - `overflow: hidden`:
      - It does not work automatic positioning of tooltips.
    - `transform: translate(-100vw, -100vh)`:
      - Causes screen shaking on Chromium browsers.
  */
  position: fixed;

  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;

  pointer-events: none;
  overflow: hidden;
  > * { // Restore styles in children
    pointer-events: unset;
    overflow: unset;
  }
}

.tooltip__overlay {
  @include set-visibility(false);
  @include fixed-fullscreen;

  /*
    The z-index is set for both visible and invisible states to ensure it maintains its stacking order
    above other elements during transitions. This approach prevents the tooltip from falling behind other
    elements during the fade-in and fade-out animations.
  */
  z-index: 10;

  /*
    Reset white-space to the default value to prevent inheriting styles from the trigger element.
    This prevents unintentional layout issues or overflow.
  */
  white-space: normal;
}

.tooltip__trigger {
  @include hover-or-touch {
    + .tooltip__overlay {
      @include set-visibility(true);
    }
  }
}

.tooltip__content {
  background: $color-tooltip-background;
  color: $color-on-primary;
  border-radius: 16px;
  padding: $spacing-absolute-large $spacing-absolute-medium;

  // Explicitly set font styling for tooltips to prevent inconsistent appearances due to style inheritance from trigger elements.
  @include base-font-style;

  /*
    This margin creates a visual buffer between the tooltip and the edges of the document.
    It prevents the tooltip from appearing too close to the edges, ensuring a visually pleasing
    and balanced layout.
    Avoiding setting vertical margin as it disrupts the arrow rendering.
  */
  margin-left: $spacing-absolute-xx-small;
  margin-right: $spacing-absolute-xx-small;

  // Setting max-width increases readability and consistency reducing overlap and clutter.
  @include set-property-ch-value-with-fallback(
    $property: max-width,
    /*
      Research in typography suggests that an optimal line length for text readability is between 50-75 characters per line.
      Tooltips should be brief, so aiming for the for the lower end of this range (around 50 characters).
    */
    $value-in-ch: 50,
  )
}

.tooltip__arrow {
  background: $color-tooltip-background;
}
</style>
