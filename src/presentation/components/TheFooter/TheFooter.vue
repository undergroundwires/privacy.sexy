<template>
  <div>
    <div class="footer">
      <div class="footer__section">
        <span v-if="isDesktop" class="footer__section__item">
          <font-awesome-icon class="icon" :icon="['fas', 'globe']"  />
          <span>
            Online version at <a :href="homepageUrl" target="_blank">{{ homepageUrl }}</a>
          </span>
        </span>
        <span v-else class="footer__section__item">
          <DownloadUrlList />
        </span>
      </div>
      <div class="footer__section">
        <div class="footer__section__item">
          <a :href="feedbackUrl" target="_blank">
            <font-awesome-icon class="icon" :icon="['far', 'smile']"  />
            <span>Feedback</span>
          </a>
        </div>
        <div class="footer__section__item">
          <a :href="repositoryUrl" target="_blank">
            <font-awesome-icon class="icon" :icon="['fab', 'github']"  />
            <span>Source Code</span>
          </a>
        </div>
        <div class="footer__section__item">
          <a :href="releaseUrl" target="_blank">
            <font-awesome-icon class="icon" :icon="['fas', 'tag']"  />
            <span>v{{ version }}</span>
          </a>
        </div>
        <div class="footer__section__item">
          <font-awesome-icon class="icon" :icon="['fas', 'user-secret']"  />
          <a @click="$refs.privacyDialog.show()">Privacy</a>
        </div>
      </div>
    </div>
    <Dialog ref="privacyDialog">
        <PrivacyPolicy />
    </Dialog>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { Environment } from '@/application/Environment/Environment';
import Dialog from '@/presentation/components/Shared/Dialog.vue';
import { IApplication } from '@/domain/IApplication';
import { ApplicationFactory } from '@/application/ApplicationFactory';
import DownloadUrlList from './DownloadUrlList.vue';
import PrivacyPolicy from './PrivacyPolicy.vue';

@Component({
  components: {
    Dialog, PrivacyPolicy, DownloadUrlList,
  },
})
export default class TheFooter extends Vue {
  public readonly isDesktop = Environment.CurrentEnvironment.isDesktop;

  public version = '';

  public repositoryUrl = '';

  public releaseUrl = '';

  public feedbackUrl = '';

  public homepageUrl = '';

  public async created() {
    const app = await ApplicationFactory.Current.getApp();
    this.initialize(app);
  }

  private initialize(app: IApplication) {
    const { info } = app;
    this.version = info.version;
    this.homepageUrl = info.homepage;
    this.repositoryUrl = info.repositoryWebUrl;
    this.releaseUrl = info.releaseUrl;
    this.feedbackUrl = info.feedbackUrl;
  }
}
</script>

<style scoped lang="scss">
@use "@/presentation/assets/styles/main" as *;

.icon {
  margin-right: 0.5em;
  text-decoration: none;
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
    @media screen and (max-width: $media-screen-big-width) {
      justify-content: space-around;
      width: 100%;
      &:not(:first-child) {
        margin-top: 0.7em;
      }
    }
    flex-wrap: wrap;
    font-size: 1rem;
    font-family: $font-normal;
    &__item:not(:first-child) {
      &::before {
        content: "|";
        padding: 0 5px;
      }
      @media screen and (max-width: $media-screen-big-width) {
        margin-top: 3px;
        &::before {
          content: "";
          padding: 0;
        }
      }
    }
  }
}
</style>
