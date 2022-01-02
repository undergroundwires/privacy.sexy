<template>
  <div class="instructions">
    <p>
      Since you're using online version of {{ this.appName }}, you will need to do additional
      steps after downloading the file to execute your script on macOS:
    </p>
    <p>
      <ol>
        <li>
          <span>Download the file</span>
          <font-awesome-icon
            class="explanation"
            :icon="['fas', 'info-circle']"
            v-tooltip.top-center="
              'You should be prompted to save the script file now'
              + ', otherwise try to download it again'"
          />
        </li>
        <li>
          <span>Open terminal</span>
          <font-awesome-icon
            class="explanation"
            :icon="['fas', 'info-circle']"
            v-tooltip.top-center="
              'Type Terminal into Spotlight or open from the Applications -> Utilities folder'"
          />
        </li>
        <li>
          <span>Navigate to the folder where you downloaded the file e.g.:</span>
          <div>
            <Code>cd ~/Downloads</Code>
            <font-awesome-icon
              class="explanation"
              :icon="['fas', 'info-circle']"
              v-tooltip.top-center="
                'Press on Enter/Return key after running the command.<br/>'
                + 'If the file is not downloaded on Downloads folder, change'
                + '`Downloads` to path where the file is downloaded.<br/>'
                + '• `cd` will change the current folder.<br/>'
                + '• `~` is the user home directory.'"
            />
          </div>
        </li>
        <li>
          <span>Give the file execute permissions:</span>
          <div>
            <Code>chmod +x {{ this.fileName }}</Code>
            <font-awesome-icon
              class="explanation"
              :icon="['fas', 'info-circle']"
              v-tooltip.top-center="
                  'Press on Enter/Return key after running the command.<br/>' +
                  'It will make the file executable.'"
            />
          </div>
        </li>
        <li>
          <span>Execute the file:</span>
          <div>
            <Code>./{{ this.fileName }}</Code>
            <font-awesome-icon
              class="explanation"
              :icon="['fas', 'info-circle']"
              v-tooltip.top-center="'Alternatively you can double click on the file'"
            />
          </div>
        </li>
        <li>
          <span>If asked, enter your administrator password</span>
          <font-awesome-icon
              class="explanation"
              :icon="['fas', 'info-circle']"
              v-tooltip.top-center="
                  'Press on Enter/Return key after typing your password<br/>' +
                  'Your password will not be shown by default.<br/>' +
                  'Administor privileges are required to configure OS.'"
          />
        </li>
      </ol>
    </p>
    <p>
      Or download the <a :href="this.macOsDownloadUrl">offline version</a> to run your scripts
      directly to skip these steps.
    </p>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { ApplicationFactory } from '@/application/ApplicationFactory';
import Code from './Code.vue';

@Component({
  components: {
    Code,
  },
})
export default class MacOsInstructions extends Vue {
  @Prop() public fileName: string;

  public appName = '';

  public macOsDownloadUrl = '';

  public async created() {
    const app = await ApplicationFactory.Current.getApp();
    this.appName = app.info.name;
    this.macOsDownloadUrl = app.info.getDownloadUrl(OperatingSystem.macOS);
  }
}
</script>

<style scoped lang="scss">
@use "@/presentation/assets/styles/main" as *;

li {
  margin: 10px 0;
}
.explanation {
    margin-left: 0.5em;
}
</style>
