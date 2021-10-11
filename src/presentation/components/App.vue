<template>
  <div id="app">
      <div class="app__wrapper">
        <TheHeader class="app__row" />
        <TheSearchBar class="app__row" />
        <TheScriptArea class="app__row" />
        <TheCodeButtons class="app__row app__code-buttons" />
        <TheFooter />
      </div>
   </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import TheHeader from '@/presentation/components/TheHeader.vue';
import TheFooter from '@/presentation/components/TheFooter/TheFooter.vue';
import TheCodeButtons from '@/presentation/components/Code/CodeButtons/TheCodeButtons.vue';
import TheScriptArea from '@/presentation/components/Scripts/TheScriptArea.vue';
import TheSearchBar from '@/presentation/components/TheSearchBar.vue';

@Component({
  components: {
    TheHeader,
    TheCodeButtons,
    TheScriptArea,
    TheSearchBar,
    TheFooter,
  },
})
export default class App extends Vue {

}
</script>

<style lang="scss">
@import "@/presentation/styles/colors.scss";
@import "@/presentation/styles/fonts.scss";
@import "@/presentation/styles/media.scss";

* {
  box-sizing: border-box;
}

a {
    color:inherit;
    text-decoration: underline;
    cursor: pointer;
    &:hover {
        color: $color-primary;
    }
}

body {
  background: $color-background;
  font-family: $main-font;
}

#app {
  margin-right: auto;
  margin-left: auto;
  max-width: 1600px;
  .app__wrapper {
    margin: 0% 2% 0% 2%;
    background-color: $color-surface;
    color: $color-on-surface;
    box-shadow: 0 0 5px 0 rgba(0, 0, 0, 0.06);
    padding: 2%;
    display:flex;
    flex-direction: column;
    .app__row {
      margin-bottom: 10px;
    }
    .app__code-buttons {
      padding-bottom: 10px;
    }
  }
}

@import "@/presentation/styles/tooltip.scss";
@import "@/presentation/styles/tree.scss";
</style>
