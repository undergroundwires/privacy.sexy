<template>
  <div v-if="isOpen" class="dev-toolkit-container">
    <div class="dev-toolkit">
      <h3 class="toolkit-header">
        <span class="title">
          Tools
        </span>
        <FlatButton icon="xmark" class="close-button" @click="close" />
      </h3>
      <hr />
      <ul class="action-buttons">
        <li
          v-for="action in devActions"
          :key="action.name"
        >
          <button
            type="button"
            class="action-button"
            @click="action.handler"
          >
            {{ action.name }}
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { injectKey } from '@/presentation/injectionSymbols';
import FlatButton from '@/presentation/components/Shared/FlatButton.vue';
import { dumpNames } from './DumpNames';

export default defineComponent({
  components: {
    FlatButton,
  },
  setup() {
    const { log } = injectKey((keys) => keys.useLogger);
    const isOpen = ref(true);

    const devActions: readonly DevAction[] = [
      {
        name: 'Log script/category names',
        handler: async () => {
          const names = await dumpNames();
          log.info(names);
        },
      },
    ];

    function close() {
      isOpen.value = false;
    }

    return {
      devActions,
      isOpen,
      close,
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

.dev-toolkit-container {
  position: fixed;
  top: 0;
  right: 0;
  background-color: rgba($color-on-surface, 0.5);
  color: $color-on-primary;
  padding: 10px;
  z-index: 10000;

  display:flex;
  flex-direction: column;

  /* Minimize interaction, so it does not interfere with events targeting elements behind it to allow easier tests */
  pointer-events: none;
  * > button {
    pointer-events: initial;
  }
}

.dev-toolkit {
  display:flex;
  flex-direction: column;

  .toolkit-header {
    display:flex;
    flex-direction: row;
    align-items: center;
    .title {
      flex: 1;
    }
    .close-button {
      flex-shrink: 0;
    }
  }

  .title {
    text-align: center;
  }

  .action-buttons {
    display: flex;
    flex-direction: column;
    gap: 10px;
    @include reset-ul;

    .action-button {
      @include reset-button;

      display: block;
      padding: 5px 10px;
      background-color: $color-primary;
      color: $color-on-primary;
      border: none;
      cursor: pointer;

      @include hover-or-touch {
        background-color: $color-secondary;
        color: $color-on-secondary;
      }
    }
  }
}
</style>
