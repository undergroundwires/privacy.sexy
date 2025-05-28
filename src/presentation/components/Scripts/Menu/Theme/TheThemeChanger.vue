<template>
  <MenuOptionList
    label="Theme"
    class="part"
  >
    <MenuOptionListItem
      v-for="theme in themeOptions"
      :key="theme.type"
      :label="theme.displayName"
      :enabled="currentTheme !== theme.type"
      @click="setTheme(theme.type)"
    />
  </MenuOptionList>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import MenuOptionList from '../MenuOptionList.vue';
import MenuOptionListItem from '../MenuOptionListItem.vue';
import { ThemeType } from './ThemeType';

const DefaultView = ThemeType.System;
interface IThemeOption {
  readonly type: ThemeType;
  readonly displayName: string;
}
const themeOptions: readonly IThemeOption[] = [
  { type: ThemeType.System, displayName: 'System' },
  { type: ThemeType.Light, displayName: 'Light' },
  { type: ThemeType.Dark, displayName: 'Dark' },
];

export default defineComponent({
  components: {
    MenuOptionList,
    MenuOptionListItem,
  },
  emits: {
    /* eslint-disable @typescript-eslint/no-unused-vars */
    themeChanged: (themeType: ThemeType) => true,
    /* eslint-enable @typescript-eslint/no-unused-vars */
  },
  setup(_, { emit }) {
    const currentTheme = ref<ThemeType>();

    setTheme(DefaultView);

    function setTheme(theme: ThemeType) {
      if (currentTheme.value === theme) {
        throw new Error(`Theme is already "${ThemeType[theme]}"`);
      }
      currentTheme.value = theme;
      emit('themeChanged', currentTheme.value);
    }
    return {
      ThemeType,
      themeOptions,
      currentTheme,
      setTheme,
    };
  },
});
</script>
