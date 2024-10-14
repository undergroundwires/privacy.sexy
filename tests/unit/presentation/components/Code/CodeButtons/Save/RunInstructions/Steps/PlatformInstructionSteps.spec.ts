import { shallowMount } from '@vue/test-utils';
import PlatformInstructionSteps from '@/presentation/components/Code/CodeButtons/Save/BrowserRunInstructions/Steps/PlatformInstructionSteps.vue';
import { useCollectionState } from '@/presentation/components/Shared/Hooks/UseCollectionState';
import { InjectionKeys } from '@/presentation/injectionSymbols';
import { UseCollectionStateStub } from '@tests/unit/shared/Stubs/UseCollectionStateStub';
import { AllSupportedOperatingSystems, type SupportedOperatingSystem } from '@tests/shared/TestCases/SupportedOperatingSystems';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { CategoryCollectionStateStub } from '@tests/unit/shared/Stubs/CategoryCollectionStateStub';
import WindowsInstructions from '@/presentation/components/Code/CodeButtons/Save/BrowserRunInstructions/Steps/Platforms/WindowsInstructions.vue';
import MacOsInstructions from '@/presentation/components/Code/CodeButtons/Save/BrowserRunInstructions/Steps/Platforms/MacOsInstructions.vue';
import LinuxInstructions from '@/presentation/components/Code/CodeButtons/Save/BrowserRunInstructions/Steps/Platforms/LinuxInstructions.vue';
import type { Component } from 'vue';

describe('PlatformInstructionSteps', () => {
  const testScenarios: Record<SupportedOperatingSystem, Component> = {
    [OperatingSystem.Windows]: WindowsInstructions,
    [OperatingSystem.macOS]: MacOsInstructions,
    [OperatingSystem.Linux]: LinuxInstructions,
  };
  AllSupportedOperatingSystems.forEach((operatingSystemKey) => {
    const operatingSystem = operatingSystemKey as SupportedOperatingSystem;
    it(`renders the correct component for ${OperatingSystem[operatingSystem]}`, () => {
      // arrange
      const expectedComponent = testScenarios[operatingSystem];
      const useCollectionStateStub = new UseCollectionStateStub()
        .withState(new CategoryCollectionStateStub().withOs(operatingSystem));

      // act
      const wrapper = mountComponent({
        useCollectionState: useCollectionStateStub.get(),
      });

      // assert
      expect(wrapper.findComponent(expectedComponent).exists()).to.equal(true);
    });
    it(`binds the correct filename for ${OperatingSystem[operatingSystem]}`, () => {
      // arrange
      const expectedFilename = 'expected-file-name.bat';
      const wrappedComponent = testScenarios[operatingSystem];
      const useCollectionStateStub = new UseCollectionStateStub()
        .withState(new CategoryCollectionStateStub().withOs(operatingSystem));

      // act
      const wrapper = mountComponent({
        useCollectionState: useCollectionStateStub.get(),
        filename: expectedFilename,
      });

      // assert
      const componentWrapper = wrapper.findComponent(wrappedComponent);
      const propertyValues = componentWrapper.props();
      const propertyValue = 'filename' in propertyValues ? propertyValues.filename : undefined;
      expect(propertyValue).to.equal(expectedFilename);
    });
  });
});

function mountComponent(options?: {
  readonly useCollectionState?: ReturnType<typeof useCollectionState>;
  readonly filename?: string;
}) {
  return shallowMount(PlatformInstructionSteps, {
    global: {
      provide: {
        [InjectionKeys.useCollectionState.key]:
          () => options?.useCollectionState ?? new UseCollectionStateStub().get(),
      },
    },
    props: {
      filename: options?.filename === undefined ? 'privacy-test-script.bat' : options.filename,
    },
  });
}
