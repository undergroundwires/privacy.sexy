import { it, describe, expect } from 'vitest';
import { connectApisWithContextBridge } from '@/presentation/electron/preload/ContextBridging/ApiContextBridge';

describe('ApiContextBridge', () => {
  describe('connectApisWithContextBridge', () => {
    it('can provide keys and values', () => {
      // arrange
      const bridgeConnector = () => {};
      // act
      const act = () => connectApisWithContextBridge(bridgeConnector);
      // assert
      expect(act).to.not.throw();
    });
  });
});
