<template>
  <span
    class="container"
    v-bind:class="{
      'container-unsupported': !hasCurrentOsDesktopVersion,
      'container-supported': hasCurrentOsDesktopVersion,
    }">
    <span class="description">
      <font-awesome-icon class="description__icon" :icon="['fas', 'desktop']" />
      <span class="description__text">For desktop:</span>
    </span>
    <span class="urls">
      <span class="urls__url" v-for="os of supportedDesktops" v-bind:key="os">
        <DownloadUrlListItem :operatingSystem="os" />
      </span>
    </span>
  </span>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { Environment } from '@/application/Environment/Environment';
import { OperatingSystem } from '@/domain/OperatingSystem';
import DownloadUrlListItem from './DownloadUrlListItem.vue';

@Component({
  components: { DownloadUrlListItem },
})
export default class DownloadUrlList extends Vue {
  public readonly supportedDesktops: ReadonlyArray<OperatingSystem>;

  public readonly hasCurrentOsDesktopVersion: boolean = false;

  constructor() {
    super();
    const supportedOperativeSystems = [
      OperatingSystem.Windows, OperatingSystem.Linux, OperatingSystem.macOS];
    const currentOs = Environment.CurrentEnvironment.os;
    this.supportedDesktops = supportedOperativeSystems.sort((os) => (os === currentOs ? 0 : 1));
    this.hasCurrentOsDesktopVersion = supportedOperativeSystems.includes(currentOs);
  }
}
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
