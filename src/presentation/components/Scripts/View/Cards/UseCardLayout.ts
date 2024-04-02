import { computed, type Ref } from 'vue';

export function useCardLayout(options: {
  readonly containerWidth: Readonly<Ref<number>>;
  readonly totalCards: Readonly<Ref<number>>;
}): Readonly<Ref<CardLayout>> {
  return computed(() => {
    return determineCardLayout(
      options.containerWidth.value,
      options.totalCards.value,
    );
  });
}

export interface CardLayout {
  readonly totalRows: number;
  readonly totalColumns: number;
  readonly availableCardWidth: number;
}

function determineCardLayout(
  containerWidth: number,
  totalCards: number,
): CardLayout {
  const containerSize = getContainerSize(containerWidth);
  const totalColumns = countTotalColumns(containerSize);
  const totalRows = countTotalRows(totalColumns, totalCards);
  return {
    totalColumns,
    totalRows,
    availableCardWidth: containerWidth / totalRows,
  };
}

enum ContainerSize {
  Small,
  Medium,
  Big,
}

function countTotalRows(totalColumns: number, totalCards: number): number {
  return Math.ceil(totalCards / totalColumns);
}

function countTotalColumns(size: ContainerSize): number {
  switch (size) {
    case ContainerSize.Small:
      return 1;
    case ContainerSize.Medium:
      return 2;
    case ContainerSize.Big:
      return 3;
    default:
      throw new Error(`Unknown size: ${size}`);
  }
}

function getContainerSize(containerWidth: number): ContainerSize {
  const smallBreakpoint = 500;
  const bigBreakpoint = 750;
  if (containerWidth <= smallBreakpoint) {
    return ContainerSize.Small;
  }
  if (containerWidth < bigBreakpoint) {
    return ContainerSize.Medium;
  }
  return ContainerSize.Big;
}
