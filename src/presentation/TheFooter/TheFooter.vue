<template>
  <div>
    <div class="footer">
      <div class="footer__section">
        <div class="item">
          <a :href="releaseUrl" target="_blank">{{ version }}</a>
        </div>
        <div class="item">
          <a @click="$modal.show(modalName)">Privacy</a>
        </div>
      </div>
      <div class="footer__section">
        <span v-if="isDesktop">
          Online version at <a href="https://privacy.sexy" target="_blank">https://privacy.sexy</a>
        </span>
        <DownloadUrlList v-else />
      </div>
    </div>
    <modal :name="modalName" height="auto" :scrollable="true" :adaptive="true">
      <div class="modal">
        <PrivacyPolicy class="modal__content"/>
        <div class="modal__close-button">
          <font-awesome-icon :icon="['fas', 'times']"  @click="$modal.hide(modalName)"/>
        </div>
      </div>
    </modal>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { StatefulVue } from '@/presentation/StatefulVue';
import { Environment } from '@/application/Environment/Environment';
import PrivacyPolicy from './PrivacyPolicy.vue';
import DownloadUrlList from './DownloadUrlList.vue';
import { OperatingSystem } from '@/application/Environment/OperatingSystem';

@Component({
  components: {
    PrivacyPolicy, DownloadUrlList,
  },
})
export default class TheFooter extends StatefulVue {
  public readonly modalName = 'privacy-policy';
  public readonly isDesktop: boolean;

  public version: string = '';
  public releaseUrl: string = '';

  constructor() {
    super();
    this.isDesktop = Environment.CurrentEnvironment.isDesktop;
  }

  public async mounted() {
    const state = await this.getCurrentStateAsync();
    this.version = `v${state.app.version}`;
    this.releaseUrl = `${state.app.repositoryUrl}/releases/tag/${state.app.version}`;
  }
}
</script>

<style scoped lang="scss">
@import "@/presentation/styles/colors.scss";
@import "@/presentation/styles/fonts.scss";

$medium-screen-width: 767px;


.footer {
  display: flex;
  justify-content: space-between;
  @media screen and (max-width: $medium-screen-width) {  
    flex-direction: column;
    align-items: center;
  }
  flex-wrap: wrap;
  &__section {
    display: flex;
    color: $dark-gray;
    font-size: 1rem;
    font-family: $normal-font;
    &:not(:first-child) {
      padding-top: 3px;
    }
    a {
      color:inherit;
      text-decoration: underline;
      cursor: pointer;
      &:hover {
        opacity: 0.8;
      }
    }

    .item:not(:first-child)::before {
      content: "|";
      padding: 0 5px;
    }
  }
}
.modal {
    margin-bottom: 10px;
    display: flex;
    flex-direction: row;

    &__content {
      width: 100%;
    }

    &__close-button {
      width: auto;
      font-size: 1.5em;
      margin-right:0.25em;
      align-self: flex-start;
      cursor: pointer;
      &:hover {
        opacity: 0.9;
      }
    }
}
</style>
