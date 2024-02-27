import { describe, it, expect } from 'vitest';
import { type DialogFactory, useDialog } from '@/presentation/components/Shared/Hooks/Dialog/UseDialog';
import { DialogStub } from '@tests/unit/shared/Stubs/DialogStub';

describe('UseDialog', () => {
  describe('useDialog', () => {
    it('returns provided dialog instance', () => {
      // arrange
      const expectedDialog = new DialogStub();
      const factoryMock: DialogFactory = () => expectedDialog;

      // act
      const { dialog } = useDialog(factoryMock);

      // assert
      expect(dialog).to.equal(expectedDialog);
    });
  });
});
