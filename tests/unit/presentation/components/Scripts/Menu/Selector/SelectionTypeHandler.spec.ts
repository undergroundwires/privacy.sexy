import { describe, it, expect } from 'vitest';
import {
  SelectionCheckContext, SelectionMutationContext, SelectionType,
  getCurrentSelectionType, setCurrentSelectionType,
} from '@/presentation/components/Scripts/Menu/Selector/SelectionTypeHandler';
import { scrambledEqual } from '@/application/Common/Array';
import { RecommendationLevel } from '@/domain/RecommendationLevel';
import { ICategoryCollectionState } from '@/application/Context/State/ICategoryCollectionState';
import { SelectionStateTestScenario } from './SelectionStateTestScenario';

describe('SelectionTypeHandler', () => {
  describe('setCurrentSelectionType', () => {
    it('throws when type is custom', () => {
      // arrange
      const expectedError = 'cannot select custom type';
      const scenario = new SelectionStateTestScenario();
      const state = scenario.generateState([]);
      // act
      const act = () => setCurrentSelectionType(SelectionType.Custom, createMutationContext(state));
      // assert
      expect(act).to.throw(expectedError);
    });
    describe('select types as expected', () => {
      // arrange
      const scenario = new SelectionStateTestScenario();
      const initialScriptsCases = [{
        name: 'when nothing is selected',
        initialScripts: [],
      }, {
        name: 'when some scripts are selected',
        initialScripts: [...scenario.allStandard, ...scenario.someStrict],
      }, {
        name: 'when all scripts are selected',
        initialScripts: scenario.all,
      }];
      for (const initialScriptsCase of initialScriptsCases) {
        describe(initialScriptsCase.name, () => {
          const state = scenario.generateState(initialScriptsCase.initialScripts);
          const typeExpectations = [{
            input: SelectionType.None,
            output: [],
          }, {
            input: SelectionType.Standard,
            output: scenario.allStandard,
          }, {
            input: SelectionType.Strict,
            output: [...scenario.allStandard, ...scenario.allStrict],
          }, {
            input: SelectionType.All,
            output: scenario.all,
          }];
          for (const expectation of typeExpectations) {
            // act
            it(`${SelectionType[expectation.input]} returns as expected`, () => {
              setCurrentSelectionType(expectation.input, createMutationContext(state));
              // assert
              const actual = state.selection.selectedScripts;
              const expected = expectation.output;
              expect(scrambledEqual(actual, expected));
            });
          }
        });
      }
    });
  });
  describe('getCurrentSelectionType', () => {
    // arrange
    const scenario = new SelectionStateTestScenario();
    const testCases = [{
      name: 'when nothing is selected',
      selection: [],
      expected: SelectionType.None,
    }, {
      name: 'when some standard scripts are selected',
      selection: scenario.someStandard,
      expected: SelectionType.Custom,
    }, {
      name: 'when all standard scripts are selected',
      selection: scenario.allStandard,
      expected: SelectionType.Standard,
    }, {
      name: 'when all standard and some strict scripts are selected',
      selection: [...scenario.allStandard, ...scenario.someStrict],
      expected: SelectionType.Custom,
    }, {
      name: 'when all standard and strict scripts are selected',
      selection: [...scenario.allStandard, ...scenario.allStrict],
      expected: SelectionType.Strict,
    }, {
      name: 'when strict scripts are selected but not standard',
      selection: scenario.allStrict,
      expected: SelectionType.Custom,
    }, {
      name: 'when all standard and strict, and some unrecommended are selected',
      selection: [...scenario.allStandard, ...scenario.allStrict, ...scenario.someUnrecommended],
      expected: SelectionType.Custom,
    }, {
      name: 'when all scripts are selected',
      selection: scenario.all,
      expected: SelectionType.All,
    }];
    for (const testCase of testCases) {
      it(testCase.name, () => {
        const state = scenario.generateState(testCase.selection);
        // act
        const actual = getCurrentSelectionType(createCheckContext(state));
        // assert
        expect(actual).to.deep.equal(
          testCase.expected,
          `Actual: "${SelectionType[actual]}", expected: "${SelectionType[testCase.expected]}"`
            + `\nSelection: ${printSelection()}`,
        );
        function printSelection() {
          // eslint-disable-next-line prefer-template
          return `total: ${testCase.selection.length}\n`
            + 'scripts:\n'
            + testCase.selection
              .map((s) => `{ id: ${s.script.id}, level: ${s.script.level === undefined ? 'unknown' : RecommendationLevel[s.script.level]} }`)
              .join(' | ');
        }
      });
    }
  });
});

function createMutationContext(state: ICategoryCollectionState): SelectionMutationContext {
  return {
    selection: state.selection,
    collection: state.collection,
  };
}

function createCheckContext(state: ICategoryCollectionState): SelectionCheckContext {
  return {
    selection: state.selection,
    collection: state.collection,
  };
}
