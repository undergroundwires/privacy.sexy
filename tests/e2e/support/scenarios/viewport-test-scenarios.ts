const SmallScreen: ViewportScenario = {
  name: 'iPhone SE', width: 375, height: 667,
};

const MediumScreen: ViewportScenario = {
  name: '13-inch Laptop', width: 1280, height: 800,
};

export const LargeScreen: ViewportScenario = {
  name: '4K Ultra HD Desktop', width: 3840, height: 2160,
};

export const ViewportTestScenarios: readonly ViewportScenario[] = [
  SmallScreen,
  MediumScreen,
  LargeScreen,
] as const;

interface ViewportScenario {
  readonly name: string;
  readonly width: number;
  readonly height: number;
}
