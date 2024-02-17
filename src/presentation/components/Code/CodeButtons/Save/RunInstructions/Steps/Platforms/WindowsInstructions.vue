<template>
  <InstructionSteps>
    <InstructionStep>
      Download the file.
      <InfoTooltip>
        <p>If a save prompt doesn't appear, try downloading the script again.</p>
      </InfoTooltip>
    </InstructionStep>
    <InstructionStep>
      If warned by your browser, keep the file.
      <InfoTooltip>
        <!--
          Tests (15/01/2023):
          - Edge (Defender activated): "filename isn't commonly downloaded..."
          - Chrome: No warning, downloads directly.
          - Firefox: No warning, downloads directly.
        -->
        <p>
          Browsers may warn you when downloading scripts.
        </p>
        <p>
          privacy.sexy scripts are verified to be safe and are dedicated to securing your privacy.
        </p>
        <p>
          In <strong>Edge</strong>:
        </p>
        <ol>
          <li>Select <strong>Keep</strong> from the downloads section.</li>
          <li>Click <strong>Show more</strong> on the next warning.</li>
          <li>Select <strong>Keep anyway</strong>.</li>
        </ol>
        <p>
          For <strong>Firefox</strong> and <strong>Chrome</strong>, typically no additional
          action is needed.
        </p>
      </InfoTooltip>
    </InstructionStep>
    <InstructionStep>
      If your antivirus (e.g., Defender) alerts you, address the warning.
      <InfoTooltip>
        <!--
          Tests (15/01/2023):
          - Edge (Defender activated): "Couldn't download - Virus detected"
          - Chrome: "Virus detected"
          - Firefox: Does not trigger false-positive on Defender somehow.
        -->
        <p>
          Depending on the script, antivirus software may incorrectly flag the download as a threat.
        </p>
        <p>
          These false positives are common for scripts that modify system settings.
          Don't worry; privacy.sexy is secure, transparent, and open-source.
        </p>
        <p>
          To handle false warnings in Microsoft Defender:
        </p>
        <ol>
          <li>
            Open <strong>Virus & threat protection</strong> from
            the <strong>Start</strong> menu.
          </li>
          <li>
            Locate the event in <strong>Protection history</strong>
            that pertains to the script.
          </li>
          <li>In the event details, select <strong>Actions</strong> > <strong>Allow</strong>.</li>
          <li>If the script was deleted, please re-download it.</li>
        </ol>
        <blockquote>
          <strong>Caution:</strong>
          <p>For your security, remember to</p>
          <ul>
            <li>only allow scripts from trusted sources,</li>
            <li>avoid broad exclusions in your antivirus settings,</li>
            <li>and keep real-time protection enabled whenever possible.</li>
          </ul>
        </blockquote>
      </InfoTooltip>
    </InstructionStep>
    <InstructionStep>
      <!--
        Tests (15/01/2023):
        - Edge (Defender activated): No prompts
        - Chrome: No prompts
        - Firefox: "filename is executable file. Executable files may contain..?" OK/Cancel
      -->
      Open the downloaded file.
      <InfoTooltip>
        <p>
          Confirm any browser prompts to open the file.
        </p>
        <p>
          This standard security measure ensures that you are aware of the script execution.
        </p>
        <p>
          <strong>Firefox</strong> users, click <strong>OK</strong> to acknowledge the
          executable file warning.
        </p>
        <p>
          <strong>Edge</strong> and <strong>Chrome</strong> users usually will not
          encounter additional prompts.
        </p>
      </InfoTooltip>
    </InstructionStep>
    <InstructionStep>
      If prompted, confirm SmartScreen warnings.
      <InfoTooltip>
        <p>
          Windows SmartScreen might display a cautionary message.
        </p>
        <p>
          This happens since privacy.sexy scripts are not recognized
          by Microsoft's certification process.
        </p>
        <p>
          <ol>
            <li>Select <strong>More info</strong>.</li>
            <li>Select <strong>Run anyway</strong>.</li>
          </ol>
        </p>
      </InfoTooltip>
    </InstructionStep>
    <InstructionStep>
      If administrative permissions are requested, grant them.
      <InfoTooltip>
        <p>
          The script may request administrative rights to apply changes.
        </p>
        <p>
          This is necessary for the script to apply the intended privacy settings.
        </p>
        <p>
          Click <strong>Yes</strong> to authorize and run the script.
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

export default defineComponent({
  components: {
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
