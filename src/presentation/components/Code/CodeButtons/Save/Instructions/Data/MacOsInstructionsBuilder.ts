import { OperatingSystem } from '@/domain/OperatingSystem';
import { InstructionsBuilder } from './InstructionsBuilder';

export class MacOsInstructionsBuilder extends InstructionsBuilder {
  constructor() {
    super(OperatingSystem.macOS);
    super
      .withStep(() => ({
        action: {
          instruction: 'Download the file.',
          details: 'You should have already been prompted to save the script file.'
            + '<br/>If this was not the case or you did not save the script when prompted,'
            + '<br/>please try to download your script file again.'
          ,
        },
      }))
      .withStep(() => ({
        action: {
          instruction: 'Open terminal.',
          details: 'Type Terminal into Spotlight or open it from the Applications -> Utilities folder.',
        },
      }))
      .withStep(() => ({
        action: {
          instruction: 'Navigate to the folder where you downloaded the file e.g.:',
        },
        code: {
          instruction: 'cd ~/Downloads',
          details: 'Press on <code>enter/return</code> key after running the command.'
            + '<br/>If the file is not downloaded on Downloads folder,'
            + '<br/>change <code>Downloads</code> to path where the file is downloaded.'
            + '<br/>'
            + '<br/>This command means:'
            + '<ul>'
            + '<li><code>cd</code> will change the current folder.</li>'
            + '<li><code>~</code> is the user home directory.</li>'
            + '</ul>',
        },
      }))
      .withStep((data) => ({
        action: {
          instruction: 'Give the file execute permissions:',
        },
        code: {
          instruction: `chmod +x ${data.fileName}`,
          details: 'Press on <code>enter/return</code> key after running the command.<br/>'
            + 'It will make the file executable.'
          ,
        },
      }))
      .withStep((data) => ({
        action: {
          instruction: 'Execute the file:',
        },
        code: {
          instruction: `./${data.fileName}`,
          details: 'Alternatively you can locate the file in <strong>Finder</strong> and double click on it.',
        },
      }))
      .withStep(() => ({
        action: {
          instruction: 'If asked, enter your administrator password.',
          details: 'As you type, your password will be hidden but the keys are still registered, so keep typing.'
            + '<br/>Press on <code>enter/return</code> key after typing your password.'
            + '<br/>Administrator privileges are required to configure OS.'
          ,
        },
      }));
  }
}
