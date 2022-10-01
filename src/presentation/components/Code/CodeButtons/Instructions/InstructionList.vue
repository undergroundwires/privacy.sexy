<template>
  <div class="instructions">
    <p>
      You have two alternatives to apply your selection.
    </p>
    <hr />
    <p>
      <strong>1. The easy alternative</strong>. Run your script without any manual steps by
      <a :href="this.macOsDownloadUrl">downloading desktop version</a> of {{ this.appName }} on the
       {{ this.osName }} system you wish to configure, and then click on the Run button. This is
       recommended for most users.
    </p>
    <hr />
    <p>
      <strong>2. The hard (manual) alternative</strong>. This requires you to do additional manual
      steps. If you are unsure how to follow the instructions, hover on information
      (<font-awesome-icon :icon="['fas', 'info-circle']" />)
      icons near the steps, or follow the easy alternative described above.
    </p>
    <p>
      <ol>
        <li
          v-for='(step, index) in this.data.steps'
          v-bind:key="index"
          class="step"
        >
          <div class="step__action">
            <span>{{ step.action.instruction }}</span>
            <font-awesome-icon
              v-if="step.action.details"
              class="explanation"
              :icon="['fas', 'info-circle']"
              v-tooltip.top-center="step.action.details"
            />
          </div>
          <div v-if="step.code" class="step__code">
            <Code>{{ step.code.instruction }}</Code>
            <font-awesome-icon
              v-if="step.code.details"
              class="explanation"
              :icon="['fas', 'info-circle']"
              v-tooltip.top-center="step.code.details"
            />
          </div>
        </li>
      </ol>
    </p>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { ApplicationFactory } from '@/application/ApplicationFactory';
import Code from './Code.vue';
import { IInstructionListData } from './InstructionListData';

@Component({
  components: {
    Code,
  },
})
export default class InstructionList extends Vue {
  public appName = '';

  public macOsDownloadUrl = '';

  public osName = '';

  @Prop() public data: IInstructionListData;

  public async created() {
    if (!this.data) {
      throw new Error('missing data');
    }
    const app = await ApplicationFactory.Current.getApp();
    this.appName = app.info.name;
    this.macOsDownloadUrl = app.info.getDownloadUrl(OperatingSystem.macOS);
    this.osName = renderOsName(this.data.operatingSystem);
  }
}

function renderOsName(os: OperatingSystem): string {
  switch (os) {
    case OperatingSystem.Windows: return 'Windows';
    case OperatingSystem.macOS: return 'macOS';
    case OperatingSystem.Linux: return 'Linux';
    default: throw new RangeError(`Cannot render os name: ${OperatingSystem[os]}`);
  }
}
</script>

<style scoped lang="scss">
@use "@/presentation/assets/styles/main" as *;

.step {
  margin: 10px 0;
  &__action {
    display: flex;
    flex-direction: row;
    align-items: center;
  }
  &__code {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-top: 0.5em;
  }
}
.explanation {
    margin-left: 0.5em;
}
</style>
