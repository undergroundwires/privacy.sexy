<template>
    <div class="privacy-policy">
        <div class="line">
            <div class="line__emoji">🚫🍪</div>
            <div>No cookies!</div>
        </div>
        <div class="line">
            <div class="line__emoji">🚫👀</div>
            <div>No user behavior / IP adress collection!</div>
        </div>
        <div class="line">
            <div class="line__emoji">🤖</div>
            <div>Website is deployed automatically from master branch
            of the <a :href="repositoryUrl" target="_blank">source code</a> with no changes.</div>
        </div>
        <div class="line">
            <div class="line__emoji">📈</div>
            <div>Basic <a href="https://aws.amazon.com/cloudfront/reporting/" target="_blank">CDN statistics</a>
            are collected by AWS but they cannot be related to you or your behavior.</div>
        </div>
        <div class="line">
            <div class="line__emoji">🎉</div>
            <div>As almost no data is colected, the website gets better only with your active feedback.
            Feel free to <a :href="feedbackUrl" target="_blank">create an issue</a> 😊</div>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { StatefulVue } from '@/presentation/StatefulVue';

@Component
export default class TheFooter extends StatefulVue {
  private repositoryUrl: string = '';
  private feedbackUrl: string = '';

  public async mounted() {
    const state = await this.getCurrentStateAsync();
    this.repositoryUrl = state.app.repositoryUrl;
    this.feedbackUrl = `${state.app.repositoryUrl}/issues`;
  }
}
</script>

<style scoped lang="scss">
@import "@/presentation/styles/fonts.scss";
.privacy-policy {
    display: flex;
    flex-direction: column;
    font-family: $normal-font;
    text-align:center;

    .line {
        display: flex;
        flex-direction: column;

        &:not(:first-child) {
          margin-top:0.2rem;
        }
    }

    a {
      color:inherit;
      &:hover {
        opacity: 0.8;
      }
    }
}
</style>
