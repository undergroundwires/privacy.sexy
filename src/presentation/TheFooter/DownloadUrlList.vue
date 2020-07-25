<template>
  <span v-bind:class="{ 'unsupported': !hasCurrentOsDesktopVersion, 'supported': hasCurrentOsDesktopVersion }">
    For desktop:
    <span class="urls">
      <span class="urls__url" v-for="os of supportedDesktops" v-bind:key="os">
        <DownloadUrlListItem :operatingSystem="os" />
      </span>
    </span>
  </span>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Environment } from '@/application/Environment/Environment';
import { OperatingSystem } from '@/application/Environment/OperatingSystem';
import DownloadUrlListItem from './DownloadUrlListItem.vue';

@Component({
  components: { DownloadUrlListItem },
})
export default class DownloadUrlList extends Vue {
  public readonly supportedDesktops: ReadonlyArray<OperatingSystem>;
  public readonly hasCurrentOsDesktopVersion: boolean = false;

  constructor() {
    super();
    const supportedOperativeSystems = [OperatingSystem.Windows, OperatingSystem.Linux, OperatingSystem.macOS];
    const currentOs = Environment.CurrentEnvironment.os;
    this.supportedDesktops = supportedOperativeSystems.sort((os) => os === currentOs ? 0 : 1);
    this.hasCurrentOsDesktopVersion = supportedOperativeSystems.includes(currentOs);
  }
}
</script>

<style scoped lang="scss">
.unsupported {
  font-size: 0.85em;
}
.supported {
  font-size: 1em;
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
