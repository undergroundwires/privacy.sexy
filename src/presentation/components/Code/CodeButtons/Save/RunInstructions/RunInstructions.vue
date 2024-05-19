<template>
  <section>
    <p>
      You have two alternatives to apply your selection.
    </p>
    <article>
      <h3>1. The Easy Alternative</h3>
      <p>
        Run your script without any manual steps by
        <a :href="downloadUrl">downloading desktop version</a> of {{ appName }} on the
        {{ osName }} system you wish to configure, and then click on the Run button. This is
        recommended for most users.
      </p>
    </article>
    <article>
      <h3>2. The Hard (Manual) Alternative</h3>
      <p>
        This requires you to do additional manual
        steps. If you are unsure how to follow the instructions, tap or hover on information
        <InfoTooltipInline>Engage with icons like this for extra wisdom!</InfoTooltipInline>
        icons near the steps, or follow the easy alternative described above.
      </p>
      <p>
        <PlatformInstructionSteps :filename="filename" />
      </p>
    </article>
  </section>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { injectKey } from '@/presentation/injectionSymbols';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { getOperatingSystemDisplayName } from '@/presentation/components/Shared/OperatingSystemNames';
import InfoTooltipInline from './Help/InfoTooltipInline.vue';
import PlatformInstructionSteps from './Steps/PlatformInstructionSteps.vue';

export default defineComponent({
  components: {
    InfoTooltipInline,
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
      () => getOperatingSystemDisplayName(operatingSystem.value),
    );

    return {
      appName,
      downloadUrl,
      osName,
    };
  },
});
</script>

<style scoped lang="scss">
</style>
