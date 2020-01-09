<template>
  <div id="app">
      <div class="wrapper">
          <TheHeader class="row" />
          <TheSearchBar class="row" />
          <TheScripts class="row"/>
          <TheCodeArea class="row" theme="xcode" />
          <TheCodeButtons class="row" />
          <TheFooter />
      </div>
   </div>
</template>

<script lang="ts">
import { Component, Vue, Prop  } from 'vue-property-decorator';
import { ApplicationState, IApplicationState } from '@/application/State/ApplicationState';
import TheHeader from '@/presentation/TheHeader.vue';
import TheFooter from '@/presentation/TheFooter.vue';
import TheCodeArea from '@/presentation/TheCodeArea.vue';
import TheCodeButtons from '@/presentation/TheCodeButtons.vue';
import TheSearchBar from '@/presentation/TheSearchBar.vue';
import TheScripts from '@/presentation/Scripts/TheScripts.vue';

@Component({
  components: {
    TheHeader,
    TheCodeArea,
    TheCodeButtons,
    TheScripts,
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
  max-width: 1500px;
  
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
  }
}


@import "@/presentation/styles/tooltip.scss";
@import "@/presentation/styles/tree.scss";
</style>
