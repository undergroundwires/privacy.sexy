<template>
  <MenuOptionList
    label="View"
    class="part">
    <MenuOptionListItem
      v-for="view in viewOptions"
      :key="view.type"
      :label="view.displayName"
      :enabled="currentView !== view.type"
      @click="setView(view.type)"
    />
  </MenuOptionList>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import MenuOptionList from '../MenuOptionList.vue';
import MenuOptionListItem from '../MenuOptionListItem.vue';
import { ViewType } from './ViewType';

const DefaultView = ViewType.Cards;
interface IViewOption {
  readonly type: ViewType;
  readonly displayName: string;
}
const viewOptions: readonly IViewOption[] = [
  { type: ViewType.Cards, displayName: 'Cards' },
  { type: ViewType.Tree, displayName: 'Tree' },
];

export default defineComponent({
  components: {
    MenuOptionList,
    MenuOptionListItem,
  },
  emits: {
    /* eslint-disable @typescript-eslint/no-unused-vars */
    viewChanged: (viewType: ViewType) => true,
    /* eslint-enable @typescript-eslint/no-unused-vars */
  },
  setup(_, { emit }) {
    const currentView = ref<ViewType>();

    setView(DefaultView);

    function setView(view: ViewType) {
      if (currentView.value === view) {
        throw new Error(`View is already "${ViewType[view]}"`);
      }
      currentView.value = view;
      emit('viewChanged', currentView.value);
    }
    return {
      ViewType,
      viewOptions,
      currentView,
      setView,
    };
  },
});

interface IViewOption {
  readonly type: ViewType;
  readonly displayName: string;
}
</script>
