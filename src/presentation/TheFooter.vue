<template>
  <div class="footer">
    <div class="item">
      <a :href="releaseUrl" target="_blank">{{ version }}</a>
      </div>
    <div class="item">
      <a @click="$modal.show(modalName)">Privacy</a> <!-- href to #privacy to avoid scrolling to top -->
    </div>
    <modal :name="modalName" height="auto" :scrollable="true" :adaptive="true">
      <div class="modal">
        <ThePrivacyPolicy class="modal__content"/>
        <div class="modal__close-button">
          <font-awesome-icon :icon="['fas', 'times']"  @click="$modal.hide(modalName)"/>
        </div>
      </div>
    </modal>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { StatefulVue } from './StatefulVue';
import ThePrivacyPolicy from './ThePrivacyPolicy.vue';

@Component({
  components: {
    ThePrivacyPolicy,
  },
})
export default class TheFooter extends StatefulVue {
  private readonly modalName = 'privacy-policy';
  private version: string = '';
  private releaseUrl: string = '';

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
.footer {
    display: flex;
    color: $dark-gray;
    font-size: 1rem;
    font-family: $normal-font;
    align-self: center;
    
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
