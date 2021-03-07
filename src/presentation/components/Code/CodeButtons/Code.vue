<template>
    <span class="code-wrapper">
        <span class="dollar">$</span>
        <code><slot></slot></code>
        <font-awesome-icon
            class="copy-button"
            :icon="['fas', 'copy']"
            @click="copyCode"
            v-tooltip.top-center="'Copy'"
        />
    </span>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { Clipboard } from '@/infrastructure/Clipboard';

@Component
export default class Code extends Vue {
  public copyCode(): void {
    const code = this.$slots.default[0].text;
    Clipboard.copyText(code);
  }
}
</script>

<style scoped lang="scss">
@import "@/presentation/styles/colors.scss";
@import "@/presentation/styles/fonts.scss";

.code-wrapper {
    white-space: nowrap;
    justify-content: space-between;
    font-family: $normal-font;
    background-color: $slate;
    color: $light-gray;
    padding-left: 0.3rem;
    padding-right: 0.3rem;
    .dollar {
        margin-right: 0.5rem;
        font-size: 0.8rem;
        user-select: none;
    }
    .copy-button {
        margin-left: 1rem;
        cursor: pointer;
        &:hover {
            opacity: 0.8;
        }
    }
    code {
        font-size: 1.2rem;
    }
}
</style>
