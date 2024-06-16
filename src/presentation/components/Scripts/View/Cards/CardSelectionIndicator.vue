<template>
  <div class="icon">
    <AppIcon
      v-if="isAnyChildSelected && !areAllChildrenSelected"
      icon="battery-half"
    />
    <AppIcon
      v-if="areAllChildrenSelected"
      icon="battery-full"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, type PropType } from 'vue';
import AppIcon from '@/presentation/components/Shared/Icon/AppIcon.vue';
import { injectKey } from '@/presentation/injectionSymbols';
import type { Category } from '@/domain/Executables/Category/Category';
<<<<<<< HEAD
import type { ICategoryCollection } from '@/domain/Collection/ICategoryCollection';
import type { ExecutableId } from '@/domain/Executables/Identifiable';
=======
import type { CategoryCollection } from '@/domain/Collection/CategoryCollection';
import type { ExecutableId } from '@/domain/Executables/ExecutableKey/ExecutableKey';
>>>>>>> cbea6fa3 (Add unique script/category IDs $49, $59, $262, $126)

export default defineComponent({
  components: {
    AppIcon,
  },
  props: {
    categoryId: {
      type: String as PropType<ExecutableId>,
      required: true,
    },
  },
  setup(props) {
    const { currentState } = injectKey((keys) => keys.useCollectionState);
    const { currentSelection } = injectKey((keys) => keys.useUserSelectionState);
    const currentCollection = computed<CategoryCollection>(() => currentState.value.collection);

    const currentCategory = computed<Category>(
      () => currentCollection.value.getCategory(props.categoryId),
    );

    const isAnyChildSelected = computed<boolean>(
      () => currentSelection.value.categories.isAnyScriptSelected(currentCategory.value),
    );

    const areAllChildrenSelected = computed<boolean>(
      () => currentSelection.value.categories.areAllScriptsSelected(currentCategory.value),
    );

    return {
      isAnyChildSelected,
      areAllChildrenSelected,
    };
  },
});

</script>

<style scoped lang="scss">
@use "@/presentation/assets/styles/main" as *;
.icon {
  font-size: $font-size-absolute-normal;
}
</style>
@/domain/Collection/ICategoryCollection
@/domain/Executables/Identifiable/Identifiable
