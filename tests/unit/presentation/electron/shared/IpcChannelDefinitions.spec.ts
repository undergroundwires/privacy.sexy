import { describe, it, expect } from 'vitest';
import { type ChannelDefinitionKey, IpcChannelDefinitions } from '@/presentation/electron/shared/IpcBridging/IpcChannelDefinitions';
import { expectArrayEquals } from '@tests/shared/Assertions/ExpectArrayEquals';
import { getUnsafeTypedEntries } from '@/TypeHelpers';

describe('IpcChannelDefinitions', () => {
  it('defines IPC channels correctly', () => {
    const testScenarios: Record<ChannelDefinitionKey, {
      readonly expectedNamespace: string;
      readonly expectedAccessibleMembers: readonly string[];
    }> = {
      CodeRunner: {
        expectedNamespace: 'code-run',
        expectedAccessibleMembers: ['runCode'],
      },
      Dialog: {
        expectedNamespace: 'dialogs',
        expectedAccessibleMembers: ['saveFile'],
      },
      ScriptDiagnosticsCollector: {
        expectedNamespace: 'script-diagnostics-collector',
        expectedAccessibleMembers: ['collectDiagnosticInformation'],
      },
    };
    getUnsafeTypedEntries(testScenarios).forEach((
      [definitionKey, { expectedNamespace, expectedAccessibleMembers }],
    ) => {
      describe(`channel: "${definitionKey}"`, () => {
        const ipcChannelUnderTest = IpcChannelDefinitions[definitionKey];
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
          expectArrayEquals(actualAccessibleMembers, expectedAccessibleMembers);
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
        const accessibleMembersOfChannel = channel.accessibleMembers as string[];
        // act
        const repeatedAccessibleMembersInChannel = accessibleMembersOfChannel
          .filter((item, index) => accessibleMembersOfChannel.indexOf(item) !== index);
        // assert
        expect(repeatedAccessibleMembersInChannel).to.have.lengthOf(0);
      });
    });
  });
});
