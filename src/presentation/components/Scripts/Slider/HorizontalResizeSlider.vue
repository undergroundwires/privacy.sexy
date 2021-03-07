<template>
    <div class="slider">
        <div class="left" ref="leftElement">
            <slot name="left"></slot>
        </div>
        <Handle class="handle" @resized="onResize($event)" />
        <div class="right">
            <slot name="right"></slot>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import Handle from './Handle.vue';

@Component({
  components: {
    Handle,
  },
})
export default class HorizontalResizeSlider extends Vue {
    private get left(): HTMLElement { return this.$refs.leftElement as HTMLElement; }

    public onResize(displacementX: number): void {
        const leftWidth = this.left.offsetWidth + displacementX;
        this.left.style.width = `${leftWidth}px`;
    }
}
</script>

<style lang="scss" scoped>
@import "@/presentation/styles/media.scss";

.slider {
    display: flex;
    flex-direction: row;
    .right {
        flex: 1;
    }
}
@media screen and (max-width: $vertical-view-breakpoint) {
    .slider {
        flex-direction: column;
        .left {
            width: auto !important;
        }
        .handle {
            display: none;
        }
    }
}
</style>
