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
  useFloating, arrow, shift, flip, Placement, offset, Side, Coords, autoUpdate,
} from '@floating-ui/vue';
import { defineComponent, shallowRef, computed } from 'vue';
import { useResizeObserverPolyfill } from '@/presentation/components/Shared/Hooks/UseResizeObserverPolyfill';
import type { CSSProperties } from 'vue';

const GAP_BETWEEN_TOOLTIP_AND_TRIGGER_IN_PX = 2;
const ARROW_SIZE_IN_PX = 4;
const MARGIN_FROM_DOCUMENT_EDGE_IN_PX = 2;

export default defineComponent({
  setup() {
    const tooltipDisplayElement = shallowRef<HTMLElement | undefined>();
    const triggeringElement = shallowRef<HTMLElement | undefined>();
    const arrowElement = shallowRef<HTMLElement | undefined>();
    const placement = shallowRef<Placement>('top');

    useResizeObserverPolyfill();

    const { floatingStyles, middlewareData } = useFloating(
      triggeringElement,
      tooltipDisplayElement,
      {
        placement,
        middleware: [
          offset(ARROW_SIZE_IN_PX + GAP_BETWEEN_TOOLTIP_AND_TRIGGER_IN_PX),
          /* Shifts the element along the specified axes in order to keep it in view. */
          shift({
            padding: MARGIN_FROM_DOCUMENT_EDGE_IN_PX,
          }),
          /*  Changes the placement of the floating element in order to keep it in view,
              with the ability to flip to any placement. */
          flip(),
          arrow({ element: arrowElement }),
        ],
        whileElementsMounted: autoUpdate,
      },
    );
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
  @if $isVisible {
    visibility: visible;
    opacity: 1;
    transition: opacity .15s, visibility .15s;
  } @else {
    visibility: hidden;
    opacity: 0;
    transition: opacity .15s, visibility .15s;
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
}

.tooltip__trigger {
  @include hover-or-touch {
    + .tooltip__overlay {
      z-index: 10000;
      @include set-visibility(true);
    }
  }
}

.tooltip__content {
  background: $color-tooltip-background;
  color: $color-on-primary;
  border-radius: 16px;
  padding: 5px 10px 4px;
}

.tooltip__arrow {
  background: $color-tooltip-background;
}
</style>
