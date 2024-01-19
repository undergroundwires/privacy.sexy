import { describe, it, expect } from 'vitest';
import {
  SelectionCheckContext, SelectionMutationContext, SelectionType,
  getCurrentSelectionType, setCurrentSelectionType,
} from '@/presentation/components/Scripts/Menu/Selector/SelectionTypeHandler';
import { RecommendationLevel } from '@/domain/RecommendationLevel';
import { ICategoryCollectionState } from '@/application/Context/State/ICategoryCollectionState';
import { EnumRangeTestRunner } from '@tests/unit/application/Common/EnumRangeTestRunner';
import { ScriptSelection } from '@/application/Context/State/Selection/Script/ScriptSelection';
import { MethodCall } from '@tests/unit/shared/Stubs/StubWithObservableMethodCalls';
import { expectExists } from '@tests/shared/Assertions/ExpectExists';
import { scrambledEqual } from '@/application/Common/Array';
import { IScript } from '@/domain/IScript';
import { SelectionStateTestScenario } from './SelectionStateTestScenario';

describe('SelectionTypeHandler', () => {
  describe('setCurrentSelectionType', () => {
    describe('throws with invalid type', () => {
      // arrange
      const scenario = new SelectionStateTestScenario();
      const { stateStub } = scenario.generateState([]);
      // act
      const act = (type: SelectionType) => setCurrentSelectionType(
        type,
        createMutationContext(stateStub),
      );
      // assert
      new EnumRangeTestRunner(act)
        .testInvalidValueThrows(SelectionType.Custom, 'Cannot select custom type.')
        .testOutOfRangeThrows((value) => `Cannot handle the type: ${SelectionType[value]}`);
    });
    describe('select types as expected', () => {
      // arrange
      const scenario = new SelectionStateTestScenario();
      const testScenarios: ReadonlyArray<{
        readonly givenType: SelectionType;
        readonly expectedCall: MethodCall<ScriptSelection>;
      }> = [
        {
          givenType: SelectionType.None,
          expectedCall: {
            methodName: 'deselectAll',
            args: [],
          },
        },
        {
          givenType: SelectionType.Standard,
          expectedCall: {
            methodName: 'selectOnly',
            args: [
              scenario.allStandard.map((s) => s.script),
            ],
          },
        },
        {
          givenType: SelectionType.Strict,
          expectedCall: {
            methodName: 'selectOnly',
            args: [[
              ...scenario.allStandard.map((s) => s.script),
              ...scenario.allStrict.map((s) => s.script),
            ]],
          },
        },
        {
          givenType: SelectionType.All,
          expectedCall: {
            methodName: 'selectAll',
            args: [],
          },
        },
      ];
      testScenarios.forEach(({
        givenType, expectedCall,
      }) => {
        it(`${SelectionType[givenType]} modifies as expected`, () => {
          const { stateStub, scriptsStub } = scenario.generateState();
          // act
          setCurrentSelectionType(givenType, createMutationContext(stateStub));
          // assert
          const call = scriptsStub.callHistory.find(
            (c) => c.methodName === expectedCall.methodName,
          );
          expectExists(call);
          if (expectedCall.args.length > 0) { /** {@link ScriptSelection.selectOnly}. */
            expect(scrambledEqual(
              call.args[0] as IScript[],
              expectedCall.args[0] as IScript[],
            )).to.equal(true);
          }
        });
      });
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
        const { stateStub } = scenario.generateState(testCase.selection);
        // act
        const actual = getCurrentSelectionType(createCheckContext(stateStub));
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
    selection: state.selection.scripts,
    collection: state.collection,
  };
}

function createCheckContext(state: ICategoryCollectionState): SelectionCheckContext {
  return {
    selection: state.selection.scripts,
    collection: state.collection,
  };
}
