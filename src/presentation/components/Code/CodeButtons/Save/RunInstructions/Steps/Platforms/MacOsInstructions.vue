<template>
  <InstructionSteps>
    <InstructionStep>
      Download the file.
      <InfoTooltipInline>
        <p>
          You should have already been prompted to save the script file.
        </p>
        <p>
          If this was not the case or you did not save the script when prompted,
          please try to download your script file again.
        </p>
      </InfoTooltipInline>
    </InstructionStep>
    <InstructionStep>
      Open terminal.
      <InfoTooltipInline>
        Type Terminal into Spotlight or open it from the Applications -> Utilities folder.
      </InfoTooltipInline>
    </InstructionStep>
    <InstructionStep>
      <p>
        Navigate to the folder where you downloaded the file e.g.:
      </p>
      <p>
        <InfoTooltipWrapper>
          <CopyableCommand>cd ~/Downloads</CopyableCommand>
          <template #info>
            <p>
              Press on <code>enter/return</code> key after running the command.
            </p>
            <p>
              If the file is not downloaded on Downloads folder,
              change <code>Downloads</code> to path where the file is downloaded.
            </p>
            <p>
              This command means:
              <ul>
                <li><code>cd</code> will change the current folder.</li>
                <li><code>~</code> is the user home directory.</li>
              </ul>
            </p>
          </template>
        </InfoTooltipWrapper>
      </p>
    </InstructionStep>
    <InstructionStep>
      <p>
        Give the file execute permissions:
      </p>
      <p>
        <InfoTooltipWrapper>
          <CopyableCommand>chmod +x {{ filename }}</CopyableCommand>
          <template #info>
            <p>
              Press on <code>enter/return</code> key after running the command.
            </p>
            <p>
              It will make the file executable.
            </p>
          </template>
        </InfoTooltipWrapper>
      </p>
    </InstructionStep>
    <InstructionStep>
      <p>
        Execute the file:
      </p>
      <p>
        <InfoTooltipWrapper>
          <CopyableCommand>./{{ filename }}</CopyableCommand>
          <template #info>
            Alternatively you can locate the file in <strong>Finder</strong> and double click on it.
          </template>
        </InfoTooltipWrapper>
      </p>
    </InstructionStep>
    <InstructionStep>
      If asked, enter your administrator password.
      <InfoTooltipInline>
        <p>
          As you type, your password will be hidden but the keys are
          still registered, so keep typing.
        </p>
        <p>
          Press on <code>enter/return</code> key after typing your password.
        </p>
        <p>
          Administrator privileges are required to configure OS.
        </p>
      </InfoTooltipInline>
    </InstructionStep>
  </InstructionSteps>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import InstructionSteps from '../InstructionSteps.vue';
import InstructionStep from '../InstructionStep.vue';
import InfoTooltipInline from '../../Help/InfoTooltipInline.vue';
import InfoTooltipWrapper from '../../Help/InfoTooltipWrapper.vue';
import CopyableCommand from '../CopyableCommand.vue';

export default defineComponent({
  components: {
    CopyableCommand,
    InfoTooltipInline,
    InfoTooltipWrapper,
    InstructionSteps,
    InstructionStep,
  },
  props: {
    filename: {
      type: String,
      required: true,
    },
  },
});
</script>
