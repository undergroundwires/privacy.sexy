<template>
  <div class="dev-toolkit">
    <div class="title">
      Tools
    </div>
    <hr />
    <button
      v-for="action in devActions"
      :key="action.name"
      type="button"
      @click="action.handler"
    >
      {{ action.name }}
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { injectKey } from '@/presentation/injectionSymbols';
import { dumpNames } from './DumpNames';

export default defineComponent({
  setup() {
    const { log } = injectKey((keys) => keys.useLogger);
    const devActions: readonly DevAction[] = [
      {
        name: 'Log script/category names',
        handler: async () => {
          const names = await dumpNames();
          log.info(names);
        },
      },
    ];
    return {
      devActions,
    };
  },
});

interface DevAction {
  readonly name: string;
  readonly handler: () => void | Promise<void>;
}
</script>

<style scoped lang="scss">
@use "@/presentation/assets/styles/main" as *;

.dev-toolkit {
  position: fixed;
  top: 0;
  right: 0;
  background-color: rgba($color-on-surface, 0.5);
  color: $color-on-primary;
  padding: 10px;
  z-index: 10000;

  .title {
    font-weight: bold;
    text-align: center;
  }

  button {
    display: block;
    margin-bottom: 10px;
    padding: 5px 10px;
    background-color: $color-primary;
    color: $color-on-primary;
    border: none;
    cursor: pointer;
  }
}
</style>
