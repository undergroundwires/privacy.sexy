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
        <p>
          Opening terminal changes based on the distro you run.
        </p>
        <p>
          You may search for "Terminal" in your application launcher to find it.
        </p>
        <p>
          Alternatively use terminal shortcut for your distro if it has one by default:
          <ul>
            <li>
              <code>Ctrl-Alt-T</code>:
              Ubuntu, CentOS, Linux Mint, Elementary OS, ubermix, Kali…
            </li>
            <li>
              <code>Super-T</code>: Pop!_OS…
            </li>
            <li>
              <code>Alt-T</code>: Parrot OS…
            </li>
            <li>
              <code>Ctrl-Alt-Insert</code>: Bodhi Linux…
            </li>
          </ul>
        </p>
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
        <CopyableCommand>
          chmod +x {{ filename }}
        </CopyableCommand>
        <InfoTooltip>
          <p>
            Press on <code>enter/return</code> key after running the command.
          </p>
          <p>
            It will make the file executable.
          </p>
          <p>
            If you use desktop environment you can alternatively (instead of running the command):
            <ol>
              <li>Locate the file using your file manager.</li>
              <li>Right click on the file, select "Properties".</li>
              <li>Go to "Permissions" and check "Allow executing file as program".</li>
            </ol>
          </p>
          <p>
            These GUI steps and name of options may change depending on your file manager.'
          </p>
        </InfoTooltip>
      </p>
    </InstructionStep>
    <InstructionStep>
      <p>
        Execute the file:
      </p>
      <p>
        <CopyableCommand>
          ./{{ filename }}
        </CopyableCommand>
        <InfoTooltip>
          If you have desktop environment, instead of running this command you can alternatively:
          <ol>
            <li>Locate the file using your file manager.</li>
            <li>Right click on the file, select "Run as program".</li>
          </ol>
        </InfoTooltip>
      </p>
    </InstructionStep>
    <InstructionStep>
      If asked, enter your administrator password.
      <InfoTooltip>
        <p>
          As you type, your password will be hidden but the keys are still
          registered, so keep typing.
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
