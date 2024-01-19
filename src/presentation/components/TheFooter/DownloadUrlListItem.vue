<template>
  <span class="url">
    <a
      :href="downloadUrl"
      :class="{
        url__active: hasCurrentOsDesktopVersion && isCurrentOs,
        url__inactive: hasCurrentOsDesktopVersion && !isCurrentOs,
      }"
    >{{ operatingSystemName }}</a>
  </span>
</template>

<script lang="ts">
import {
  defineComponent, PropType, computed,
} from 'vue';
import { injectKey } from '@/presentation/injectionSymbols';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { getOperatingSystemDisplayName } from '@/presentation/components/Shared/OperatingSystemNames';

export default defineComponent({
  props: {
    operatingSystem: {
      type: Number as PropType<OperatingSystem>,
      required: true,
    },
  },
  setup(props) {
    const { info } = injectKey((keys) => keys.useApplication);
    const { os: currentOs } = injectKey((keys) => keys.useRuntimeEnvironment);

    const isCurrentOs = computed<boolean>(() => {
      return currentOs === props.operatingSystem;
    });

    const operatingSystemName = computed<string>(() => {
      return getOperatingSystemDisplayName(props.operatingSystem);
    });

    const hasCurrentOsDesktopVersion = computed<boolean>(() => {
      return hasDesktopVersion(props.operatingSystem);
    });

    const downloadUrl = computed<string>(() => {
      return info.getDownloadUrl(props.operatingSystem);
    });

    return {
      downloadUrl,
      operatingSystemName,
      isCurrentOs,
      hasCurrentOsDesktopVersion,
    };
  },
});

function hasDesktopVersion(os: OperatingSystem): boolean {
  return os === OperatingSystem.Windows
    || os === OperatingSystem.Linux
    || os === OperatingSystem.macOS;
}
</script>

<style scoped lang="scss">
@use "@/presentation/assets/styles/main" as *;
.url {
  &__active {
    font-size: 1em;
  }
  &__inactive {
    font-size: 0.70em;
  }
}
</style>
