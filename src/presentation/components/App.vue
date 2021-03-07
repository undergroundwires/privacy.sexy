<template>
  <div id="app">
      <div class="wrapper">
        <TheHeader class="row" />
        <TheSearchBar class="row" />
        <TheScriptArea class="row" />
        <TheCodeButtons class="row code-buttons" />
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

body {
  background: $light-gray;
  font-family: $main-font;
  color: $slate;
}

#app {
  margin-right: auto;
  margin-left: auto;
  max-width: 1600px;
  .wrapper {
    margin: 0% 2% 0% 2%;
    background-color: white;
    box-shadow: 0 0 5px 0 rgba(0, 0, 0, 0.06);
    padding: 2%;
    display:flex;
    flex-direction: column;
    .row {
      margin-bottom: 10px;
    }
    .code-buttons {
      padding-bottom: 10px;
    }
  }
}

@import "@/presentation/styles/tooltip.scss";
@import "@/presentation/styles/tree.scss";
</style>
