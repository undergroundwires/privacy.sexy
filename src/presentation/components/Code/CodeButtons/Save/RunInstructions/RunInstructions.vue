<template>
  <div class="instructions">
    <p>
      You have two alternatives to apply your selection.
    </p>
    <hr />
    <p>
      <strong>1. The easy alternative</strong>. Run your script without any manual steps by
      <a :href="downloadUrl">downloading desktop version</a> of {{ appName }} on the
      {{ osName }} system you wish to configure, and then click on the Run button. This is
      recommended for most users.
    </p>
    <hr />
    <p>
      <strong>2. The hard (manual) alternative</strong>. This requires you to do additional manual
      steps. If you are unsure how to follow the instructions, tap or hover on information
      <InfoTooltip>Engage with icons like this for extra wisdom!</InfoTooltip>
      icons near the steps, or follow the easy alternative described above.
    </p>
    <p>
      <PlatformInstructionSteps :filename="filename" />
    </p>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { injectKey } from '@/presentation/injectionSymbols';
import { OperatingSystem } from '@/domain/OperatingSystem';
import InfoTooltip from './InfoTooltip.vue';
import PlatformInstructionSteps from './Steps/PlatformInstructionSteps.vue';

export default defineComponent({
  components: {
    InfoTooltip,
    PlatformInstructionSteps,
  },
  props: {
    filename: {
      type: String,
      required: true,
    },
  },
  setup() {
    const { currentState } = injectKey((keys) => keys.useCollectionState);

    const { projectDetails } = injectKey((keys) => keys.useApplication);

    const operatingSystem = computed<OperatingSystem>(() => currentState.value.os);

    const appName = computed<string>(() => projectDetails.name);

    const downloadUrl = computed<string>(
      () => projectDetails.getDownloadUrl(operatingSystem.value),
    );

    const osName = computed<string>(
      () => renderOsName(operatingSystem.value),
    );

    return {
      appName,
      downloadUrl,
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
}
</style>
