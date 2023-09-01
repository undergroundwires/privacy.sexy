<template>
  <span class="url">
    <a
      :href="downloadUrl"
      v-bind:class="{
        url__active: hasCurrentOsDesktopVersion && isCurrentOs,
        url__inactive: hasCurrentOsDesktopVersion && !isCurrentOs,
      }">{{ operatingSystemName }}</a>
  </span>
</template>

<script lang="ts">
import {
  defineComponent, PropType, computed,
  inject,
} from 'vue';
import { InjectionKeys } from '@/presentation/injectionSymbols';
import { OperatingSystem } from '@/domain/OperatingSystem';

export default defineComponent({
  props: {
    operatingSystem: {
      type: Number as PropType<OperatingSystem>,
      required: true,
    },
  },
  setup(props) {
    const { info } = inject(InjectionKeys.useApplication);
    const { os: currentOs } = inject(InjectionKeys.useRuntimeEnvironment);

    const isCurrentOs = computed<boolean>(() => {
      return currentOs === props.operatingSystem;
    });

    const operatingSystemName = computed<string>(() => {
      return getOperatingSystemName(props.operatingSystem);
    });

    const hasCurrentOsDesktopVersion = computed<boolean>(() => {
      return hasDesktopVersion(props.operatingSystem);
    });

    const downloadUrl = computed<string | undefined>(() => {
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

function getOperatingSystemName(os: OperatingSystem): string {
  switch (os) {
    case OperatingSystem.Linux:
      return 'Linux (preview)';
    case OperatingSystem.macOS:
      return 'macOS';
    case OperatingSystem.Windows:
      return 'Windows';
    default:
      throw new Error(`Unsupported os: ${OperatingSystem[os]}`);
  }
}

</script>

<style scoped lang="scss">
@use "@/presentation/assets/styles/main" as *;
.url {
  @include clickable;
  &__active {
    font-size: 1em;
  }
  &__inactive {
    font-size: 0.70em;
  }
}
</style>
