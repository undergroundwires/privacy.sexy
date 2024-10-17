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
      Open your terminal.
      <InfoTooltipInline>
        <p>There are two easy ways to open the default terminal on your Mac:</p>
        <ol>
          <li>
            Using macOS search (<strong>Spotlight</strong>):
            <ul>
              <li>Press <kbd>Cmd</kbd> + <kbd>Space</kbd> to open <strong>Spotlight</strong>.</li>
              <li>
                Type <strong>Terminal</strong> and press <kbd>Enter</kbd> or <kbd>Return</kbd>.
              </li>
            </ul>
          </li>
          <li>
            Using <strong>Finder</strong>:
            <ul>
              <li>Open <strong>Finder</strong>.</li>
              <li>Go to <strong>Applications</strong> → <strong>Utilities</strong>.</li>
              <li>Double-click on <strong>Terminal</strong>.</li>
            </ul>
          </li>
        </ol>
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
              Press on <kbd>Enter</kbd> or <kbd>Return</kbd> key after running the command.
            </p>
            <p>
              If you didn't save the file in your <strong>Downloads</strong> folder:
            </p>
            <ol>
              <li>Locate where you saved the file.</li>
              <li>In the command, replace <code>Downloads</code> with the correct folder path.</li>
            </ol>
            <p>
              This command means:
            </p>
            <ul>
              <li><code>cd</code> will change the current folder.</li>
              <li><code>~</code> is the user home directory.</li>
            </ul>
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
              Press on <kbd>Enter</kbd> or <kbd>Return</kbd> key after running the command.
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
          Press the <kbd>Enter</kbd> or <kbd>Return</kbd> key after typing your password.
        </p>
        <p>
          Administrator privileges are required for configurations.
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
