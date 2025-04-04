import { type Coords, type Placement } from '@floating-ui/vue';
import type { CSSProperties } from 'vue';

interface ArrowOptions {
  /** Coordinates provided by floating-ui middleware */
  readonly calculatedArrowCoords?: Partial<Coords>;
  readonly tooltipPlacement: Placement;
  readonly arrowSizeInPx: number;
}

export function getArrowStyles(
  options: ArrowOptions,
): CSSProperties {
  return {
    ...getArrowPositionStyles(options),
    ...getArrowAppearanceStyles(options),
  };
}

function getArrowAppearanceStyles(options: ArrowOptions): CSSProperties {
  return {
    width: `${options.arrowSizeInPx * 2}px`,
    height: `${options.arrowSizeInPx * 2}px`,
    rotate: '45deg',
  };
}

function getArrowPositionStyles(options: ArrowOptions): CSSProperties {
  if (!options.calculatedArrowCoords) {
    return {
      display: 'none',
    };
  }
  const { x, y } = options.calculatedArrowCoords; // either X or Y is calculated
  const oppositeSide = getCounterpartBoxOffsetProperty(options.tooltipPlacement);
  const newStyle: CSSProperties = {
    position: 'absolute',
    // Position arrow on the edge opposite to the tooltip placement
    [oppositeSide]: `-${options.arrowSizeInPx}px`,
    // Center the arrow along the edge.
    // Spread syntax completely omits properties when undefined (avoiding overriding oppositeSide)
    // x/y values only exist for the perpendicular axis, so never conflict with oppositeSide
    ...(x ? { left: `${x}px` } : {}),
    ...(y ? { top: `${y}px` } : {}),
  };
  return newStyle;
}

function getCounterpartBoxOffsetProperty(placement: Placement): keyof CSSProperties {
  const currentSide = extractSide(placement);
  const sideCounterparts: Record<PlacementSide, PlacementSide> = {
    top: 'bottom',
    right: 'left',
    bottom: 'top',
    left: 'right',
  };
  return sideCounterparts[currentSide];
}

const PlacementSides = ['top', 'right', 'bottom', 'left'] as const;
export type PlacementSide = (typeof PlacementSides)[number];

function extractSide(placement: Placement): PlacementSide {
  return placement.split('-')[0] as PlacementSide;
}
