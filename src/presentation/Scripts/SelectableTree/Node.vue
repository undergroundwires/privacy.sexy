<template>
    <div id="node">
        <div>{{ this.data.text }}</div>
        <div
          v-for="url of this.data.documentationUrls"
          v-bind:key="url">
            <a :href="url"
                :alt="url"
                target="_blank" class="docs"
                  v-tooltip.top-center="url"
                v-on:click.stop>
                <font-awesome-icon :icon="['fas', 'info-circle']" />
                </a>
        </div>
    </div>
</template>


<script lang="ts">
    import { Component, Prop, Vue } from 'vue-property-decorator';
    import { INode } from './INode';
    /** Wrapper for Liquor Tree, reveals only abstracted INode for communication */
    @Component
    export default class Node extends Vue {
        @Prop() public data: INode;
    }
</script>


<style scoped lang="scss">
@import "@/presentation/styles/colors.scss";
#node {
  display:flex;
  flex-direction: row;
    flex-wrap: wrap;
  .docs {
    color: $gray;
    cursor: pointer;
    margin-left:5px;
    &:hover {
        color: $slate;
    }
  }
}

</style>