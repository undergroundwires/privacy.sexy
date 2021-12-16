export function itEachAbsentStringValue(runner: (absentValue: string) => void): void {
  itEachAbsentTestCase(AbsentStringTestCases, runner);
}

export function itEachAbsentObjectValue(
  runner: (absentValue: AbsentObjectType) => void,
): void {
  itEachAbsentTestCase(AbsentObjectTestCases, runner);
}

export function itEachAbsentCollectionValue<T>(runner: (absentValue: []) => void): void {
  itEachAbsentTestCase(getAbsentCollectionTestCases<T>(), runner);
}

export function itEachAbsentTestCase<T>(
  testCases: readonly IAbsentTestCase<T>[],
  runner: (absentValue: T) => void,
): void {
  for (const testCase of testCases) {
    it(`given "${testCase.valueName}"`, () => {
      runner(testCase.absentValue);
    });
  }
}

export const AbsentObjectTestCases: readonly IAbsentTestCase<AbsentObjectType>[] = [
  {
    valueName: 'undefined',
    absentValue: undefined,
  },
  {
    valueName: 'null',
    absentValue: null,
  },
];

export const AbsentStringTestCases: readonly IAbsentStringCase[] = [
  {
    valueName: 'empty',
    absentValue: '',
  },
  ...AbsentObjectTestCases,
];

export function getAbsentCollectionTestCases<T>(): readonly IAbsentCollectionCase<T>[] {
  return [
    ...AbsentObjectTestCases,
    {
      valueName: 'empty',
      absentValue: new Array<T>(),
    },
  ];
}

type AbsentObjectType = undefined | null;

interface IAbsentTestCase<T> {
  readonly valueName: string;
  readonly absentValue: T;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface IAbsentStringCase extends IAbsentTestCase<string> {
  // Marker interface
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface IAbsentCollectionCase<T> extends IAbsentTestCase<T[]> {
  // Marker interface
}
