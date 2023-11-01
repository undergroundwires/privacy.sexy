import type { App } from 'vue';

export interface Bootstrapper {
  bootstrap(app: App): Promise<void>;
}
