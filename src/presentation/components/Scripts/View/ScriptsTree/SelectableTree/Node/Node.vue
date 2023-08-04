<template>
  <Documentable :docs="this.data.docs">
    <div id="node">
      <div class="item text">{{ this.data.text }}</div>
      <RevertToggle
        class="item"
        v-if="data.isReversible"
        :node="data" />
    </div>
  </Documentable>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { INode } from './INode';
import RevertToggle from './RevertToggle.vue';
import Documentable from './Documentation/Documentable.vue';

@Component({
  components: {
    RevertToggle,
    Documentable,
  },
})
export default class Node extends Vue {
  @Prop() public data: INode;
}
</script>

<style scoped lang="scss">
@use "@/presentation/assets/styles/main" as *;

#node {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  .text {
    display: flex;
    align-items: center;
  }
  .item:not(:first-child) {
    margin-left: 5px;
  }
}
</style>
