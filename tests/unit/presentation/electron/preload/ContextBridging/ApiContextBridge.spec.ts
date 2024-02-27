import { it, describe, expect } from 'vitest';
import { type BridgeConnector, type MethodContextBinder, connectApisWithContextBridge } from '@/presentation/electron/preload/ContextBridging/ApiContextBridge';

describe('ApiContextBridge', () => {
  describe('connectApisWithContextBridge', () => {
    it('connects properties as keys', () => {
      // arrange
      const context = new BridgeConnectorTestContext();
      const { exposedItems, bridgeConnector } = mockBridgeConnector();
      const expectedKeys = ['a', 'b'];
      const api = {
        [`${expectedKeys[0]}`]: () => {},
        [`${expectedKeys[1]}`]: () => {},
      };

      // act
      context
        .withApiObject(api)
        .withBridgeConnector(bridgeConnector)
        .run();

      // assert
      expect(exposedItems).to.have.lengthOf(expectedKeys.length);
      expect(exposedItems.map(([key]) => key)).to.have.members(expectedKeys);
    });
    it('connects values after binding their context', () => {
      // arrange
      const context = new BridgeConnectorTestContext();
      const { exposedItems, bridgeConnector } = mockBridgeConnector();
      const rawValues = ['a', 'b'];
      const api = {
        first: rawValues[0],
        second: rawValues[1],
      };
      const boundValues = {
        [`${rawValues[0]}`]: 'bound-a',
        [`${rawValues[1]}`]: 'bound-b',
      };
      const expectedValues = Object.values(boundValues);
      const contextBinderMock: MethodContextBinder = (property) => {
        return boundValues[property as string] as never;
      };

      // act
      context
        .withApiObject(api)
        .withContextBinder(contextBinderMock)
        .withBridgeConnector(bridgeConnector)
        .run();

      // assert
      expect(exposedItems).to.have.lengthOf(rawValues.length);
      expect(exposedItems.map(([,value]) => value)).to.have.members(expectedValues);
    });
  });
});

function mockBridgeConnector() {
  const exposedItems = new Array<[string, unknown]>();
  const bridgeConnector: BridgeConnector = (key, api) => exposedItems.push([key, api]);
  return {
    exposedItems,
    bridgeConnector,
  };
}

class BridgeConnectorTestContext {
  private bridgeConnector: BridgeConnector = () => {};

  private apiObject: object = {};

  private contextBinder: MethodContextBinder = (obj) => obj;

  public withBridgeConnector(bridgeConnector: BridgeConnector): this {
    this.bridgeConnector = bridgeConnector;
    return this;
  }

  public withApiObject(apiObject: object): this {
    this.apiObject = apiObject;
    return this;
  }

  public withContextBinder(contextBinder: MethodContextBinder): this {
    this.contextBinder = contextBinder;
    return this;
  }

  public run() {
    return connectApisWithContextBridge(
      this.bridgeConnector,
      this.apiObject,
      this.contextBinder,
    );
  }
}
