<template>
  <span class="url">
    <a :href="downloadUrl"
        v-bind:class="{
            'url__active': hasCurrentOsDesktopVersion && isCurrentOs,
            'url__inactive': hasCurrentOsDesktopVersion && !isCurrentOs,
            }">{{ operatingSystemName }}</a>
  </span>
</template>

<script lang="ts">
import { Component, Prop, Watch } from 'vue-property-decorator';
import { StatefulVue } from '@/presentation/StatefulVue';
import { Environment } from '@/application/Environment/Environment';
import { OperatingSystem } from '@/domain/OperatingSystem';

@Component
export default class DownloadUrlListItem extends StatefulVue {
  @Prop() public operatingSystem!: OperatingSystem;
  public OperatingSystem = OperatingSystem;

  public downloadUrl: string = '';
  public operatingSystemName: string = '';
  public isCurrentOs: boolean = false;
  public hasCurrentOsDesktopVersion: boolean = false;

  public async mounted() {
      await this.onOperatingSystemChangedAsync(this.operatingSystem);
  }

  @Watch('operatingSystem')
  public async onOperatingSystemChangedAsync(os: OperatingSystem) {
    const currentOs = Environment.CurrentEnvironment.os;
    this.isCurrentOs = os === currentOs;
    this.downloadUrl = await this.getDownloadUrlAsync(os);
    this.operatingSystemName = getOperatingSystemName(os);
    this.hasCurrentOsDesktopVersion = hasDesktopVersion(currentOs);
  }

  private async getDownloadUrlAsync(os: OperatingSystem): Promise<string> {
    const context = await this.getCurrentContextAsync();
    return context.collection.info.getDownloadUrl(os);
  }
}

function hasDesktopVersion(os: OperatingSystem): boolean {
    return os === OperatingSystem.Windows
        || os === OperatingSystem.Linux
        || os === OperatingSystem.macOS;
}

function getOperatingSystemName(os: OperatingSystem): string {
    switch (os) {
        case OperatingSystem.Linux:
            return 'Linux';
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
.url {
    &__active {
        font-size: 1em;
    }
    &__inactive {
        font-size: 0.70em;
    }
    a {
        color:inherit;
        &:hover {
            opacity: 0.8;
        }
    }
}
</style>
