<template>
  <div>
    <div class="footer">
      <div class="footer__section">
        <span v-if="isRunningAsDesktopApplication" class="footer__section__item">
          <AppIcon class="icon" icon="globe" />
          <span>
            Online version at <a :href="homepageUrl" target="_blank" rel="noopener noreferrer">{{ homepageUrl }}</a>
          </span>
        </span>
        <span v-else class="footer__section__item">
          <DownloadUrlList />
        </span>
      </div>
      <div class="footer__section">
        <div class="footer__section__item">
          <a :href="feedbackUrl" target="_blank" rel="noopener noreferrer">
            <AppIcon class="icon" icon="face-smile" />
            <span>Feedback</span>
          </a>
        </div>
        <div class="footer__section__item">
          <a :href="repositoryUrl" target="_blank" rel="noopener noreferrer">
            <AppIcon class="icon" icon="github" />
            <span>Source Code</span>
          </a>
        </div>
        <div class="footer__section__item">
          <a :href="releaseUrl" target="_blank" rel="noopener noreferrer">
            <AppIcon class="icon" icon="tag" />
            <span>v{{ version }}</span>
          </a>
        </div>
        <div class="footer__section__item">
          <FlatButton
            label="Privacy"
            icon="user-secret"
            flat
            @click="showPrivacyDialog()"
          />
        </div>
      </div>
    </div>
    <ModalDialog v-model="isPrivacyDialogVisible">
      <PrivacyPolicy />
    </ModalDialog>
  </div>
</template>

<script lang="ts">
import {
  defineComponent, ref, computed,
} from 'vue';
import ModalDialog from '@/presentation/components/Shared/Modal/ModalDialog.vue';
import AppIcon from '@/presentation/components/Shared/Icon/AppIcon.vue';
import { injectKey } from '@/presentation/injectionSymbols';
import FlatButton from '@/presentation/components/Shared/FlatButton.vue';
import DownloadUrlList from './DownloadUrlList.vue';
import PrivacyPolicy from './PrivacyPolicy.vue';

export default defineComponent({
  components: {
    ModalDialog,
    PrivacyPolicy,
    DownloadUrlList,
    AppIcon,
    FlatButton,
  },
  setup() {
    const { projectDetails } = injectKey((keys) => keys.useApplication);
    const { isRunningAsDesktopApplication } = injectKey((keys) => keys.useRuntimeEnvironment);

    const isPrivacyDialogVisible = ref(false);

    const version = computed<string>(() => projectDetails.version.toString());

    const homepageUrl = computed<string>(() => projectDetails.homepage);

    const repositoryUrl = computed<string>(() => projectDetails.repositoryWebUrl);

    const releaseUrl = computed<string>(() => projectDetails.releaseUrl);

    const feedbackUrl = computed<string>(() => projectDetails.feedbackUrl);

    function showPrivacyDialog() {
      isPrivacyDialogVisible.value = true;
    }

    return {
      isRunningAsDesktopApplication,
      isPrivacyDialogVisible,
      showPrivacyDialog,
      version,
      homepageUrl,
      repositoryUrl,
      releaseUrl,
      feedbackUrl,
    };
  },
});
</script>

<style scoped lang="scss">
@use "@/presentation/assets/styles/main" as *;

.icon {
  margin-right: $spacing-relative-small;
}

.footer {
  display: flex;
  justify-content: space-between;
  @media screen and (max-width: $media-screen-big-width) {
    flex-direction: column;
    align-items: center;
  }
  &__section {
    display: flex;
    flex-wrap: wrap;

    @media screen and (max-width: $media-screen-big-width) {
      justify-content: space-around;
      width: 100%;
      column-gap: $spacing-relative-medium;
      &:not(:first-child) {
        margin-top: $spacing-relative-small;
      }
    }

    &__item:not(:first-child) {
      &::before {
        content: "|";
        padding: 0 $spacing-relative-small;
      }
      @media screen and (max-width: $media-screen-big-width) {
        margin-top: $spacing-absolute-xx-small;
        &::before {
          content: "";
          padding: 0;
        }
      }
    }
  }
}
</style>
