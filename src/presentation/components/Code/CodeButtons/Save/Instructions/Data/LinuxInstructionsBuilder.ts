import { OperatingSystem } from '@/domain/OperatingSystem';
import { InstructionsBuilder } from './InstructionsBuilder';

export class LinuxInstructionsBuilder extends InstructionsBuilder {
  constructor() {
    super(OperatingSystem.Linux);
    super
      .withStep(() => ({
        action: {
          instruction: 'Download the file.',
          details: 'You should have already been prompted to save the script file.'
            + '<br/>If this was not the case or you did not save the script when prompted,'
            + '<br/>please try to download your script file again.',
        },
      }))
      .withStep(() => ({
        action: {
          instruction: 'Open terminal.',
          details:
            'Opening terminal changes based on the distro you run.'
            + '<br/>You may search for "Terminal" in your application launcher to find it.'
            + '<br/>'
            + '<br/>Alternatively use terminal shortcut for your distro if it has one by default:'
            + '<ul>'
            + '<li><code>Ctrl-Alt-T</code>: Ubuntu, CentOS, Linux Mint, Elementary OS, ubermix, Kali…</li>'
            + '<li><code>Super-T</code>: Pop!_OS…</li>'
            + '<li><code>Alt-T</code>: Parrot OS…</li>'
            + '<li><code>Ctrl-Alt-Insert</code>: Bodhi Linux…</li>'
            + '</ul>'
          ,
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
            + 'It will make the file executable. <br/>'
            + 'If you use desktop environment you can alternatively (instead of running the command):'
            + '<ol>'
            + '<li>Locate the file using your file manager.</li>'
            + '<li>Right click on the file, select "Properties".</li>'
            + '<li>Go to "Permissions" and check "Allow executing file as program".</li>'
            + '</ol>'
            + '<br/>These GUI steps and name of options may change depending on your file manager.'
          ,
        },
      }))
      .withStep((data) => ({
        action: {
          instruction: 'Execute the file:',
        },
        code: {
          instruction: `./${data.fileName}`,
          details:
            'If you have desktop environment, instead of running this command you can alternatively:'
            + '<ol>'
            + '<li>Locate the file using your file manager.</li>'
            + '<li>Right click on the file, select "Run as program".</li>'
            + '</ol>'
          ,
        },
      }))
      .withStep(() => ({
        action: {
          instruction: 'If asked, enter your administrator password.',
          details: 'As you type, your password will be hidden but the keys are still registered, so keep typing.'
            + '<br/>Press on <code>enter/return</code> key after typing your password.'
            + '<br/>Administrator privileges are required to configure OS.',
        },
      }));
  }
}
