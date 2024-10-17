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
        <p>
          Opening terminal changes based on the distribution you run.
        </p>
        <p>
          You may search for "Terminal" in your application launcher to find it.
        </p>
        <p>
          Alternatively use terminal shortcut for your distribution if it has one by default:
        </p>
        <ul>
          <li>
            <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>T</kbd>:
            Ubuntu, CentOS, Linux Mint, Elementary OS, ubermix, Kali…
          </li>
          <li>
            <kbd>Super</kbd> + <kbd>T</kbd>: Pop!_OS…
          </li>
          <li>
            <kbd>Alt</kbd> + <kbd>T</kbd>: Parrot OS…
          </li>
          <li>
            <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>Insert</kbd>: Bodhi Linux…
          </li>
        </ul>
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
            <p>
              Alternatively, if you're using a graphical desktop environment, you can do this
              without the command line:
            </p>
            <ol>
              <li>Locate the file using your file manager.</li>
              <li>Right click on the file, select <strong>Properties</strong>.</li>
              <li>Go to <strong>Permissions</strong>.</li>
              <li>Check <strong>Allow executing file as program</strong>.</li>
            </ol>
            <p>
              These GUI steps and name of options may change depending on your file manager.
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
            <p>
              If you have desktop environment, instead of running this command
              you can alternatively:
            </p>
            <ol>
              <li>Locate the file using your file manager.</li>
              <li>Right click on the file.</li>
              <li>Select <strong>Run as program</strong> or similar option.</li>
            </ol>
          </template>
        </InfoTooltipWrapper>
      </p>
    </InstructionStep>
    <InstructionStep>
      If asked, enter your administrator password.
      <InfoTooltipInline>
        <p>
          As you type, your password will be hidden but the keys are still
          registered, so keep typing.
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
