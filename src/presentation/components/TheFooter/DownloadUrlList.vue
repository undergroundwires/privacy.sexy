<template>
  <span
    class="container"
    :class="{
      unsupported: !hasCurrentOsDesktopVersion,
      supported: hasCurrentOsDesktopVersion,
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
import { injectKey } from '@/presentation/injectionSymbols';
import AppIcon from '@/presentation/components/Shared/Icon/AppIcon.vue';
import DownloadUrlListItem from './DownloadUrlListItem.vue';

export default defineComponent({
  components: {
    DownloadUrlListItem,
    AppIcon,
  },
  setup() {
    const { os: currentOs } = injectKey((keys) => keys.useRuntimeEnvironment);
    const { application } = injectKey((keys) => keys.useApplication);

    const supportedOperativeSystems = application.getSupportedOsList();

    const supportedDesktops = [
      ...application.getSupportedOsList(),
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
  .unsupported {
    color: $color-primary-light;
  }
  .description {
    &__icon {
      margin-right: $spacing-relative-small;
    }
    &__text {
      margin-right: $spacing-relative-x-small;
    }
  }
}
.urls {
  &__url {
    &:not(:first-child)::before {
      content: "|";
      font-size: $font-size-absolute-x-small;
      padding: 0 $spacing-relative-small;
    }
  }
}
</style>
