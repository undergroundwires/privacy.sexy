<template>
  <span
    class="container"
    :class="{
      'container-unsupported': !hasCurrentOsDesktopVersion,
      'container-supported': hasCurrentOsDesktopVersion,
    }"
  >
    <span class="description">
      <AppIcon class="description__icon" icon="desktop" />
      <span class="description__text">For desktop:</span>
    </span>
    <span class="urls">
      <span
        v-for="os of supportedDesktops"
        :key="os"
        class="urls__url"
      >
        <DownloadUrlListItem :operating-system="os" />
      </span>
    </span>
  </span>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { injectKey } from '@/presentation/injectionSymbols';
import AppIcon from '@/presentation/components/Shared/Icon/AppIcon.vue';
import DownloadUrlListItem from './DownloadUrlListItem.vue';

const supportedOperativeSystems: readonly OperatingSystem[] = [
  OperatingSystem.Windows,
  OperatingSystem.Linux,
  OperatingSystem.macOS,
];

export default defineComponent({
  components: {
    DownloadUrlListItem,
    AppIcon,
  },
  setup() {
    const { os: currentOs } = injectKey((keys) => keys.useRuntimeEnvironment);
    const supportedDesktops = [
      ...supportedOperativeSystems,
    ].sort((os) => (os === currentOs ? 0 : 1));

    const hasCurrentOsDesktopVersion = currentOs === undefined
      ? false
      : supportedOperativeSystems.includes(currentOs);

    return {
      supportedDesktops,
      hasCurrentOsDesktopVersion,
    };
  },
});
</script>

<style scoped lang="scss">
@use "@/presentation/assets/styles/main" as *;

.container {
  display:flex;
  flex-wrap: wrap;
  justify-content: space-around;
  &-unsupported {
    opacity: $color-primary-light;
  }
  &-supported {
    font-size: 1em;
  }
  .description {
    &__icon {
      margin-right: 0.5em;
    }
    &__text {
      margin-right: 0.3em;
    }
  }
}
.urls {
  &__url {
    &:not(:first-child)::before {
      content: "|";
      font-size: 0.6rem;
      padding: 0 5px;
    }
  }
}
</style>
