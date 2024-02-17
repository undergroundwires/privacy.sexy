<template>
  <InstructionSteps>
    <InstructionStep>
      Download the file.
      <InfoTooltip>
        <p>
          You should have already been prompted to save the script file.
        </p>
        <p>
          If this was not the case or you did not save the script when prompted,
          please try to download your script file again.
        </p>
      </InfoTooltip>
    </InstructionStep>
    <InstructionStep>
      Open terminal.
      <InfoTooltip>
        Type Terminal into Spotlight or open it from the Applications -> Utilities folder.
      </InfoTooltip>
    </InstructionStep>
    <InstructionStep>
      <p>
        Navigate to the folder where you downloaded the file e.g.:
      </p>
      <p>
        <CopyableCommand>
          cd ~/Downloads
        </CopyableCommand>
        <InfoTooltip>
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
        </InfoTooltip>
      </p>
    </InstructionStep>
    <InstructionStep>
      <p>
        Give the file execute permissions:
      </p>
      <p>
        <CopyableCommand>chmod +x {{ filename }}</CopyableCommand>
        <InfoTooltip>
          <p>
            Press on <code>enter/return</code> key after running the command.
          </p>
          <p>
            It will make the file executable.
          </p>
        </InfoTooltip>
      </p>
    </InstructionStep>
    <InstructionStep>
      <p>
        Execute the file:
      </p>
      <p>
        <CopyableCommand>./{{ filename }}</CopyableCommand>
        <InfoTooltip>
          Alternatively you can locate the file in <strong>Finder</strong> and double click on it.
        </InfoTooltip>
      </p>
    </InstructionStep>
    <InstructionStep>
      If asked, enter your administrator password.
      <InfoTooltip>
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
      </InfoTooltip>
    </InstructionStep>
  </InstructionSteps>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import InstructionSteps from '../InstructionSteps.vue';
import InstructionStep from '../InstructionStep.vue';
import InfoTooltip from '../../InfoTooltip.vue';
import CopyableCommand from '../CopyableCommand.vue';

export default defineComponent({
  components: {
    CopyableCommand,
    InfoTooltip,
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
