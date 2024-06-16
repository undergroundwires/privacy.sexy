import { shallowMount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import { ref, nextTick, type Ref } from 'vue';
import { type CategoryNodeParser, useTreeViewNodeInput } from '@/presentation/components/Scripts/View/Tree/TreeViewAdapter/UseTreeViewNodeInput';
import { InjectionKeys } from '@/presentation/injectionSymbols';
import { CategoryCollectionStateStub } from '@tests/unit/shared/Stubs/CategoryCollectionStateStub';
import { UseCollectionStateStub } from '@tests/unit/shared/Stubs/UseCollectionStateStub';
import { CategoryCollectionStub } from '@tests/unit/shared/Stubs/CategoryCollectionStub';
import { CategoryStub } from '@tests/unit/shared/Stubs/CategoryStub';
import type { ICategoryCollection } from '@/domain/Collection/ICategoryCollection';
import type { NodeMetadata } from '@/presentation/components/Scripts/View/Tree/NodeContent/NodeMetadata';
import { NodeMetadataStub } from '@tests/unit/shared/Stubs/NodeMetadataStub';
import { convertToNodeInput } from '@/presentation/components/Scripts/View/Tree/TreeViewAdapter/TreeNodeMetadataConverter';
import { TreeInputNodeDataStub as TreeInputNodeData, TreeInputNodeDataStub } from '@tests/unit/shared/Stubs/TreeInputNodeDataStub';
import type { ExecutableId } from '@/domain/Executables/Identifiable/Identifiable';

describe('useTreeViewNodeInput', () => {
  describe('when given categoryId', () => {
    it('sets input nodes correctly', async () => {
      // arrange
      const testCategoryIdRef = ref<ExecutableId | undefined>();
      const {
        useStateStub, returnObject, parserMock, converterMock,
      } = mountWrapperComponent(testCategoryIdRef);
      const expectedCategoryId: ExecutableId = 'expected-category-id';
      const expectedCategoryCollection = new CategoryCollectionStub().withAction(
        new CategoryStub(expectedCategoryId),
      );
      const expectedMetadata = [new NodeMetadataStub(), new NodeMetadataStub()];
      parserMock.setupParseSingleScenario({
        givenId: expectedCategoryId,
        givenCollection: expectedCategoryCollection,
        parseResult: expectedMetadata,
      });
      const expectedNodeInputData = [new TreeInputNodeDataStub(), new TreeInputNodeDataStub()];
      expectedMetadata.forEach((metadata, index) => {
        converterMock.setupConversionScenario({
          givenMetadata: metadata,
          convertedNode: expectedNodeInputData[index],
        });
      });
      useStateStub.withState(
        new CategoryCollectionStateStub().withCollection(expectedCategoryCollection),
      );
      // act
      const { treeViewInputNodes } = returnObject;
      testCategoryIdRef.value = expectedCategoryId;
      await nextTick();
      // assert
      const actualInputNodes = treeViewInputNodes.value;
      expect(actualInputNodes).have.lengthOf(expectedNodeInputData.length);
      expect(actualInputNodes).include.members(expectedNodeInputData);
    });
  });

  describe('when not given a categoryId', () => {
    it('sets input nodes correctly', () => {
      // arrange
      const testCategoryId = ref<ExecutableId | undefined>();
      const {
        useStateStub, returnObject, parserMock, converterMock,
      } = mountWrapperComponent(testCategoryId);
      const expectedCategoryCollection = new CategoryCollectionStub().withAction(
        new CategoryStub('expected-action-category'),
      );
      const expectedMetadata = [new NodeMetadataStub(), new NodeMetadataStub()];
      parserMock.setupParseAllScenario({
        givenCollection: expectedCategoryCollection,
        parseResult: expectedMetadata,
      });
      const expectedNodeInputData = [new TreeInputNodeDataStub(), new TreeInputNodeDataStub()];
      expectedMetadata.forEach((metadata, index) => {
        converterMock.setupConversionScenario({
          givenMetadata: metadata,
          convertedNode: expectedNodeInputData[index],
        });
      });
      useStateStub.withState(
        new CategoryCollectionStateStub().withCollection(expectedCategoryCollection),
      );
      // act
      const { treeViewInputNodes } = returnObject;
      testCategoryId.value = undefined;
      // assert
      const actualInputNodes = treeViewInputNodes.value;
      expect(actualInputNodes).have.lengthOf(expectedNodeInputData.length);
      expect(actualInputNodes).include.members(expectedNodeInputData);
    });
  });
});

function mountWrapperComponent(categoryIdRef: Ref<ExecutableId | undefined>) {
  const useStateStub = new UseCollectionStateStub();
  const parserMock = mockCategoryNodeParser();
  const converterMock = mockConverter();
  let returnObject: ReturnType<typeof useTreeViewNodeInput> | undefined;

  shallowMount({
    setup() {
      returnObject = useTreeViewNodeInput(categoryIdRef, parserMock.mock, converterMock.mock);
    },
    template: '<div></div>',
  }, {
    global: {
      provide: {
        [InjectionKeys.useCollectionState.key]: () => useStateStub.get(),
      },
    },
  });

  if (!returnObject) {
    throw new Error('missing hook result');
  }

  return {
    returnObject,
    useStateStub,
    parserMock,
    converterMock,
  };
}

interface ConversionScenario {
  readonly givenMetadata: NodeMetadata;
  readonly convertedNode: TreeInputNodeData;
}

function mockConverter() {
  const scenarios = new Array<ConversionScenario>();

  const mock: typeof convertToNodeInput = (metadata) => {
    const scenario = scenarios.find((s) => s.givenMetadata === metadata);
    if (scenario) {
      return scenario.convertedNode;
    }
    return new TreeInputNodeData();
  };

  function setupConversionScenario(scenario: ConversionScenario) {
    scenarios.push(scenario);
  }

  return {
    mock,
    setupConversionScenario,
  };
}

interface ParseSingleScenario {
  readonly givenId: ExecutableId;
  readonly givenCollection: ICategoryCollection;
  readonly parseResult: NodeMetadata[];
}

interface ParseAllScenario {
  readonly givenCollection: ICategoryCollection;
  readonly parseResult: NodeMetadata[];
}

function mockCategoryNodeParser() {
  const parseSingleScenarios = new Array<ParseSingleScenario>();

  const parseAllScenarios = new Array<ParseAllScenario>();

  const mock: CategoryNodeParser = {
    parseSingle: (id, collection) => {
      const scenario = parseSingleScenarios
        .find((s) => s.givenId === id && s.givenCollection === collection);
      if (scenario) {
        return scenario.parseResult;
      }
      return [];
    },
    parseAll: (collection) => {
      const scenario = parseAllScenarios
        .find((s) => s.givenCollection === collection);
      if (scenario) {
        return scenario.parseResult;
      }
      return [];
    },
  };

  function setupParseSingleScenario(scenario: ParseSingleScenario) {
    parseSingleScenarios.push(scenario);
  }

  function setupParseAllScenario(scenario: ParseAllScenario) {
    parseAllScenarios.push(scenario);
  }

  return {
    mock,
    setupParseAllScenario,
    setupParseSingleScenario,
  };
}
