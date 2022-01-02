interface IComparerTestCase<T> {
  readonly name: string;
  readonly first: readonly T[];
  readonly second: readonly T[];
  readonly expected: boolean;
}

export class ComparerTestScenario {
  private readonly testCases: Array<IComparerTestCase<number>> = [];

  public addEmptyArrays(expectedResult: boolean) {
    return this.addTestCase({
      name: 'empty array',
      first: [],
      second: [],
      expected: expectedResult,
    }, true);
  }

  public addSameItemsWithSameOrder(expectedResult: boolean) {
    return this.addTestCase({
      name: 'same items with same order',
      first: [1, 2, 3],
      second: [1, 2, 3],
      expected: expectedResult,
    }, true);
  }

  public addSameItemsWithDifferentOrder(expectedResult: boolean) {
    return this.addTestCase({
      name: 'same items with different order',
      first: [1, 2, 3],
      second: [2, 3, 1],
      expected: expectedResult,
    }, true);
  }

  public addDifferentItemsWithSameLength(expectedResult: boolean) {
    return this.addTestCase({
      name: 'different items with same length',
      first: [1, 2, 3],
      second: [4, 5, 6],
      expected: expectedResult,
    }, true);
  }

  public addDifferentItemsWithDifferentLength(expectedResult: boolean) {
    return this.addTestCase({
      name: 'different items with different length',
      first: [1, 2],
      second: [3, 4, 5],
      expected: expectedResult,
    }, true);
  }

  public forEachCase(handler: (testCase: IComparerTestCase<number>) => void) {
    for (const testCase of this.testCases) {
      handler(testCase);
    }
  }

  private addTestCase(testCase: IComparerTestCase<number>, addReversed: boolean) {
    this.testCases.push(testCase);
    if (addReversed) {
      this.testCases.push({
        name: `${testCase.name} (reversed)`,
        first: testCase.second,
        second: testCase.first,
        expected: testCase.expected,
      });
    }
    return this;
  }
}
