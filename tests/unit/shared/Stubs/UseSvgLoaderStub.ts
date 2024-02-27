import {
  type WatchSource, computed, ref, watch,
} from 'vue';
import type { IconName } from '@/presentation/components/Shared/Icon/IconName';
import { useSvgLoader } from '@/presentation/components/Shared/Icon/UseSvgLoader';

export class UseSvgLoaderStub {
  private readonly icons = new Map<IconName, string>();

  public withSvgIcon(name: IconName, svgContent: string): this {
    this.icons.set(name, svgContent);
    return this;
  }

  public get(): typeof useSvgLoader {
    return (iconWatcher: WatchSource<IconName>) => {
      const iconName = ref<IconName | undefined>();
      watch(iconWatcher, (newIconName) => {
        iconName.value = newIconName;
      }, { immediate: true });
      return {
        svgContent: computed<string>(() => {
          if (!iconName.value) {
            return '';
          }
          return this.icons.get(iconName.value) || '';
        }),
      };
    };
  }
}
