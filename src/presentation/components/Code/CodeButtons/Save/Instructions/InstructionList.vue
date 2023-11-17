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
      steps. If you are unsure how to follow the instructions, tap or hover on information
      (<InfoTooltip>Engage with icons like this for extra wisdom!</InfoTooltip>)
      icons near the steps, or follow the easy alternative described above.
    </p>
    <p>
      <ol>
        <li
          v-for="(step, index) in data.steps"
          :key="index"
          class="step"
        >
          <div class="step__action">
            <span>{{ step.action.instruction }}</span>
            <div v-if="step.action.details" class="details-container">
              <!-- eslint-disable vue/no-v-html -->
              <InfoTooltip><div v-html="step.action.details" /></InfoTooltip>
            </div>
          </div>
          <div v-if="step.code" class="step__code">
            <CodeInstruction>{{ step.code.instruction }}</CodeInstruction>
            <div v-if="step.code.details" class="details-container">
              <!-- eslint-disable vue/no-v-html -->
              <InfoTooltip><div v-html="step.code.details" /></InfoTooltip>
            </div>
          </div>
        </li>
      </ol>
    </p>
  </div>
</template>

<script lang="ts">
import {
  defineComponent, PropType, computed,
} from 'vue';
import { injectKey } from '@/presentation/injectionSymbols';
import { OperatingSystem } from '@/domain/OperatingSystem';
import CodeInstruction from './CodeInstruction.vue';
import { IInstructionListData } from './InstructionListData';
import InfoTooltip from './InfoTooltip.vue';

export default defineComponent({
  components: {
    CodeInstruction,
    InfoTooltip,
  },
  props: {
    data: {
      type: Object as PropType<IInstructionListData>,
      required: true,
    },
  },
  setup(props) {
    const { info } = injectKey((keys) => keys.useApplication);

    const appName = computed<string>(() => info.name);

    const macOsDownloadUrl = computed<string>(
      () => info.getDownloadUrl(OperatingSystem.macOS),
    );

    const osName = computed<string>(
      () => renderOsName(props.data.operatingSystem),
    );

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
.details-container {
  margin-left: 0.5em; // Do not style icon itself to ensure correct tooltip alignment
}
</style>
