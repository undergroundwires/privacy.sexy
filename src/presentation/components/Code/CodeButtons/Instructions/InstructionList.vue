<template>
  <div class="instructions">
    <p>
      You have two alternatives to apply your selection.
    </p>
    <hr />
    <p>
      <strong>1. The easy alternative</strong>. Run your script without any manual steps by
      <a :href="macOsDownloadUrl">downloading desktop version</a> of {{ appName }} on the
      {{ osName }} system you wish to configure, and then click on the Run button. This is
      recommended for most users.
    </p>
    <hr />
    <p>
      <strong>2. The hard (manual) alternative</strong>. This requires you to do additional manual
      steps. If you are unsure how to follow the instructions, hover on information
      (<font-awesome-icon :icon="['fas', 'info-circle']" />)
      icons near the steps, or follow the easy alternative described above.
    </p>
    <p>
      <ol>
        <li
          v-for='(step, index) in data.steps'
          v-bind:key="index"
          class="step"
        >
          <div class="step__action">
            <span>{{ step.action.instruction }}</span>
            <TooltipWrapper v-if="step.action.details">
              <font-awesome-icon
                class="explanation"
                :icon="['fas', 'info-circle']"
              />
              <template v-slot:tooltip>
                <div v-html="step.action.details" />
              </template>
            </TooltipWrapper>
          </div>
          <div v-if="step.code" class="step__code">
            <CodeInstruction>{{ step.code.instruction }}</CodeInstruction>
            <TooltipWrapper v-if="step.code.details">
              <font-awesome-icon
                class="explanation"
                :icon="['fas', 'info-circle']"
              />
              <template v-slot:tooltip>
                <div v-html="step.code.details" />
              </template>
            </TooltipWrapper>
          </div>
        </li>
      </ol>
    </p>
  </div>
</template>

<script lang="ts">
import {
  defineComponent, PropType, computed,
  inject,
} from 'vue';
import { InjectionKeys } from '@/presentation/injectionSymbols';
import { OperatingSystem } from '@/domain/OperatingSystem';
import TooltipWrapper from '@/presentation/components/Shared/TooltipWrapper.vue';
import CodeInstruction from './CodeInstruction.vue';
import { IInstructionListData } from './InstructionListData';

export default defineComponent({
  components: {
    CodeInstruction,
    TooltipWrapper,
  },
  props: {
    data: {
      type: Object as PropType<IInstructionListData>,
      required: true,
    },
  },
  setup(props) {
    const { info } = inject(InjectionKeys.useApplication);

    const appName = computed<string>(() => info.name);

    const macOsDownloadUrl = computed<string>(
      () => info.getDownloadUrl(OperatingSystem.macOS),
    );

    const osName = computed<string>(() => {
      if (!props.data) {
        throw new Error('missing data');
      }
      return renderOsName(props.data.operatingSystem);
    });

    return {
      appName,
      macOsDownloadUrl,
      osName,
    };
  },
});

function renderOsName(os: OperatingSystem): string {
  switch (os) {
    case OperatingSystem.Windows: return 'Windows';
    case OperatingSystem.macOS: return 'macOS';
    case OperatingSystem.Linux: return 'Linux';
    default: throw new RangeError(`Cannot render os name: ${OperatingSystem[os]}`);
  }
}
</script>

<style scoped lang="scss">
@use "@/presentation/assets/styles/main" as *;

.step {
  margin: 10px 0;
  &__action {
    display: flex;
    flex-direction: row;
    align-items: center;
  }
  &__code {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-top: 0.5em;
  }
}
.explanation {
    margin-left: 0.5em;
}
</style>
