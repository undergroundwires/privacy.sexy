export function itEachAbsentStringValue(runner: (absentValue: string) => void): void {
  itEachTestCase(AbsentStringTestCases, runner);
}

export function itEachAbsentObjectValue(runner: (absentValue: AbsentObjectType) => void): void {
  itEachTestCase(AbsentObjectTestCases, runner);
}

export function itEachAbsentCollectionValue<T>(runner: (absentValue: []) => void): void {
  itEachTestCase(getAbsentCollectionTestCases<T>(), runner);
}

type AbsentObjectType = undefined | null;

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

function itEachTestCase<T>(
  testCases: readonly IAbsentTestCase<T>[],
  runner: (absentValue: T) => void,
): void {
  for (const testCase of testCases) {
    it(`given "${testCase.valueName}"`, () => {
      runner(testCase.absentValue);
    });
  }
}

interface IAbsentTestCase<T> {
  valueName: string;
  absentValue: T;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface IAbsentStringCase extends IAbsentTestCase<string> {
  // Marker interface
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface IAbsentCollectionCase<T> extends IAbsentTestCase<T[]> {
  // Marker interface
}
