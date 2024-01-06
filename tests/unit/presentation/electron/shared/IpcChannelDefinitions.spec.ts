import { describe, it, expect } from 'vitest';
import { IpcChannel } from '@/presentation/electron/shared/IpcBridging/IpcChannel';
import { IpcChannelDefinitions } from '@/presentation/electron/shared/IpcBridging/IpcChannelDefinitions';

describe('IpcChannelDefinitions', () => {
  it('defines IPC channels correctly', () => {
    const testScenarios: Record<keyof typeof IpcChannelDefinitions, {
      readonly expectedNamespace: string;
      readonly expectedAccessibleMembers: readonly string[];
    }> = {
      CodeRunner: {
        expectedNamespace: 'code-run',
        expectedAccessibleMembers: ['runCode'],
      },
    };
    Object.entries(testScenarios).forEach((
      [definitionKey, { expectedNamespace, expectedAccessibleMembers }],
    ) => {
      describe(`channel: "${definitionKey}"`, () => {
        const ipcChannelUnderTest = IpcChannelDefinitions[definitionKey] as IpcChannel<unknown>;
        it('has expected namespace', () => {
          // act
          const actualNamespace = ipcChannelUnderTest.namespace;
          // assert
          expect(actualNamespace).to.equal(expectedNamespace);
        });
        it('has expected accessible members', () => {
          // act
          const actualAccessibleMembers = ipcChannelUnderTest.accessibleMembers;
          // assert
          expect(actualAccessibleMembers).to.have.lengthOf(expectedAccessibleMembers.length);
          expect(actualAccessibleMembers).to.have.members(expectedAccessibleMembers);
        });
      });
    });
  });
  describe('IPC channel uniqueness', () => {
    it('has unique namespaces', () => {
      // arrange
      const extractedNamespacesFromDefinitions = Object
        .values(IpcChannelDefinitions)
        .map((channel) => channel.namespace);
      // act
      const duplicateNamespaceEntries = extractedNamespacesFromDefinitions
        .filter((item, index) => extractedNamespacesFromDefinitions.indexOf(item) !== index);
      // assert
      expect(duplicateNamespaceEntries).to.have.lengthOf(0);
    });
    it('has unique accessible members within each channel', () => {
      Object.values(IpcChannelDefinitions).forEach((channel) => {
        // arrange
        const { accessibleMembers: accessibleMembersOfChannel } = channel;
        // act
        const repeatedAccessibleMembersInChannel = accessibleMembersOfChannel
          .filter((item, index) => accessibleMembersOfChannel.indexOf(item) !== index);
        // assert
        expect(repeatedAccessibleMembersInChannel).to.have.lengthOf(0);
      });
    });
  });
});
