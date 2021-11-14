<template>
    <div id="node">
        <div class="item text">{{ this.data.text }}</div>
        <RevertToggle
          class="item"
          v-if="data.isReversible"
          :node="data" />
        <DocumentationUrls
          class="item"
          v-if="data.documentationUrls && data.documentationUrls.length > 0"
          :documentationUrls="this.data.documentationUrls" />
    </div>
</template>


<script lang="ts">
    import { Component, Prop, Vue } from 'vue-property-decorator';
    import { INode } from './INode';
    import RevertToggle from './RevertToggle.vue';
    import DocumentationUrls from './DocumentationUrls.vue';
    /** Wrapper for Liquor Tree, reveals only abstracted INode for communication */
    @Component({
        components: {
          RevertToggle,
          DocumentationUrls,
        },
    })
    export default class Node extends Vue {
        @Prop() public data: INode;
    }
</script>


<style scoped lang="scss">
@use "@/presentation/assets/styles/main" as *;

#node {
  display:flex;
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