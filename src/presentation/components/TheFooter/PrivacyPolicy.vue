<template>
  <div class="privacy-policy">
    <div v-if="!isRunningAsDesktopApplication" class="line">
      <div class="line__emoji">
        🚫🍪
      </div>
      <div>No cookies!</div>
    </div>
    <div v-if="isRunningAsDesktopApplication" class="line">
      <div class="line__emoji">
        🚫🌐
      </div>
      <div>
        Everything is offline, except single request GitHub
        to check for updates on application start.
      </div>
    </div>
    <div class="line">
      <div class="line__emoji">
        🚫👀
      </div>
      <div>No user behavior / IP address collection!</div>
    </div>
    <div class="line">
      <div class="line__emoji">
        🤖
      </div>
      <div>
        All transparent: Deployed automatically from the master branch
        of the <a :href="repositoryUrl" target="_blank" rel="noopener noreferrer">source code</a> with no changes.
      </div>
    </div>
    <div v-if="!isRunningAsDesktopApplication" class="line">
      <div class="line__emoji">
        📈
      </div>
      <div>
        Basic <a href="https://aws.amazon.com/cloudfront/reporting/" target="_blank" rel="noopener noreferrer">CDN statistics</a>
        are collected by AWS but they cannot be traced to you or your behavior.
        You can download the offline version if you don't want any CDN data collection.
      </div>
    </div>
    <div class="line">
      <div class="line__emoji">
        🎉
      </div>
      <div>
        As almost no data is collected, the application gets better
        only with your active feedback.
        Feel free to <a :href="feedbackUrl" target="_blank" rel="noopener noreferrer">create an issue</a> 😊
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { injectKey } from '@/presentation/injectionSymbols';

export default defineComponent({
  setup() {
    const { projectDetails } = injectKey((keys) => keys.useApplication);
    const { isRunningAsDesktopApplication } = injectKey((keys) => keys.useRuntimeEnvironment);

    const repositoryUrl = computed<string>(() => projectDetails.repositoryUrl);
    const feedbackUrl = computed<string>(() => projectDetails.feedbackUrl);

    return {
      repositoryUrl,
      feedbackUrl,
      isRunningAsDesktopApplication,
    };
  },
});
</script>

<style scoped lang="scss">
@use "@/presentation/assets/styles/main" as *;

.privacy-policy {
  display: flex;
  flex-direction: column;
  font-family: $font-normal;
  text-align:center;

  .line {
    display: flex;
    flex-direction: column;

    &:not(:first-child) {
      margin-top:0.2rem;
    }
  }
}
</style>
