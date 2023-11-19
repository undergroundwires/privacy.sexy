export const ViewportTestScenarios: readonly ViewportScenario[] = [
  { name: 'iPhone SE', width: 375, height: 667 },
  { name: '13-inch Laptop', width: 1280, height: 800 },
  { name: '4K Ultra HD Desktop', width: 3840, height: 2160 },
] as const;

interface ViewportScenario {
  readonly name: string;
  readonly width: number;
  readonly height: number;
}
