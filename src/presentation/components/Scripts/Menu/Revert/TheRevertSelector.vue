<template>
  <MenuOptionList
    v-if="!RevertStatusType.NoReversibleScripts"
    label="Revert"
  >
    <!--
      "None" comes before "Selected" because:
        - "None" is the default and least impactful state, placed first
          for safety and user expectations.
        - Aligns with common UI patterns of 'off' state before 'on'.
        - Helps prevent accidental actions with potential unwanted effects.
    -->
    <!-- None -->
    <TooltipWrapper>
      <MenuOptionListItem
        label="None"
        :enabled="canSetStatus(RevertStatusType.NoScriptsReverted)"
        @click="setRevertStatusType(false)"
      />
      <template #tooltip>
        <RevertStatusDocumentation
          icon="shield"
          description="Applies all selected scripts to protect your privacy."
          :considerations="createConsiderationsConditionally({
            warnNonStandard: (nonStandardCount) =>
              `${nonStandardCount} selected scripts exceed the 'Standard' recommendation level and can significantly change how your system works.`
              + ' Review your selections carefully.',
            warnIrreversibleScripts: (irreversibleCount) =>
              `${irreversibleCount} selected scripts make irreversible changes (such as privacy cleanup) that cannot be undone.`,
          })"
        />
      </template>
    </TooltipWrapper>
    <!-- Selected -->
    <TooltipWrapper>
      <MenuOptionListItem
        label="Selected"
        :enabled="canSetStatus(RevertStatusType.AllScriptsReverted)"
        @click="setRevertStatusType(true)"
      />
      <template #tooltip>
        <RevertStatusDocumentation
          icon="rotate-left"
          description="Reverts selected scripts back to their default settings where possible, balancing system functionality with privacy."
          :considerations="createConsiderationsConditionally({
            warnAlways: ['Reverting changes may reduce the level of privacy protection.'],
            warnIrreversibleScripts: (irreversibleCount) =>
              `${irreversibleCount} selected scripts make irreversible changes (such as privacy cleanup) and will not be reverted.`,
          })"
        />
      </template>
    </TooltipWrapper>
  </MenuOptionList>
</template>

<script lang="ts">
import {
  defineComponent, computed,
} from 'vue';
import { injectKey } from '@/presentation/injectionSymbols';
import TooltipWrapper from '@/presentation/components/Shared/TooltipWrapper.vue';
import { RecommendationLevel } from '@/domain/RecommendationLevel';
import { IScript } from '@/domain/IScript';
import MenuOptionList from '../MenuOptionList.vue';
import MenuOptionListItem from '../MenuOptionListItem.vue';
import RevertStatusDocumentation from './RevertStatusDocumentation.vue';
import { RevertStatusType } from './RevertStatusType';
import { setCurrentRevertStatus, getCurrentRevertStatus } from './RevertStatusHandler';

export default defineComponent({
  components: {
    MenuOptionList,
    MenuOptionListItem,
    TooltipWrapper,
    RevertStatusDocumentation,
  },
  setup() {
    const {
      currentSelection, modifyCurrentSelection,
    } = injectKey((keys) => keys.useUserSelectionState);

    const currentRevertStatusType = computed<RevertStatusType>(
      () => getCurrentRevertStatus(currentSelection.value.scripts),
    );

    const selectedScripts = computed<readonly IScript[]>(
      () => currentSelection.value.scripts.selectedScripts.map((s) => s.script),
    );

    const totalIrreversibleScriptsInSelection = computed<number>(() => {
      return selectedScripts.value.filter((s) => !s.canRevert()).length;
    });

    const totalNonStandardScriptsInSelection = computed<number>(() => {
      return selectedScripts.value.filter((s) => s.level !== RecommendationLevel.Standard).length;
    });

    function canSetStatus(status: RevertStatusType): boolean {
      if (currentRevertStatusType.value === RevertStatusType.NoReversibleScripts) {
        return false;
      }
      if (currentRevertStatusType.value === RevertStatusType.SomeScriptsReverted) {
        return true;
      }
      return currentRevertStatusType.value !== status;
    }

    function setRevertStatusType(revert: boolean) {
      modifyCurrentSelection((mutableSelection) => {
        setCurrentRevertStatus(revert, mutableSelection.scripts);
      });
    }

    function createConsiderationsConditionally(messages: {
      readonly warnIrreversibleScripts: (irreversibleCount: number) => string,
      readonly warnNonStandard?: (nonStandard: number) => string,
      readonly warnAlways?: string[];
    }): string[] {
      const considerations = new Array<string>();
      if (messages.warnAlways) {
        considerations.push(...messages.warnAlways);
      }
      const irreversibleCount = totalIrreversibleScriptsInSelection.value;
      if (irreversibleCount !== 0) {
        considerations.push(messages.warnIrreversibleScripts(irreversibleCount));
      }
      if (messages.warnNonStandard) {
        const nonStandardCount = totalNonStandardScriptsInSelection.value;
        if (nonStandardCount !== 0) {
          considerations.push(messages.warnNonStandard(nonStandardCount));
        }
      }
      return considerations;
    }

    return {
      RevertStatusType,
      currentRevertStatusType,
      setRevertStatusType,
      canSetStatus,
      createConsiderationsConditionally,
    };
  },
});
</script>
