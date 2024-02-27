import type { ScriptDiagnosticData, ScriptDiagnosticsCollector } from '@/application/ScriptDiagnostics/ScriptDiagnosticsCollector';
import { OperatingSystem } from '@/domain/OperatingSystem';
import type { Dialog } from '@/presentation/common/Dialog';

export async function createScriptErrorDialog(
  information: ScriptErrorDetails,
  scriptDiagnosticsCollector: ScriptDiagnosticsCollector | undefined,
): Promise<Parameters<Dialog['showError']>> {
  const diagnostics = await scriptDiagnosticsCollector?.collectDiagnosticInformation();
  if (information.isFileReadbackError) {
    return createAntivirusErrorDialog(information, diagnostics);
  }
  return createGenericErrorDialog(information, diagnostics);
}

export interface ScriptErrorDetails {
  readonly errorContext: 'run' | 'save';
  readonly errorType: string;
  readonly errorMessage: string;
  readonly isFileReadbackError: boolean;
}

function createGenericErrorDialog(
  information: ScriptErrorDetails,
  diagnostics: ScriptDiagnosticData | undefined,
): Parameters<Dialog['showError']> {
  return [
    selectBasedOnErrorContext({
      runningScript: 'Error Running Script',
      savingScript: 'Error Saving Script',
    }, information),
    [
      selectBasedOnErrorContext({
        runningScript: 'An error occurred while running the script.',
        savingScript: 'An error occurred while saving the script.',
      }, information),
      'This error could be caused by insufficient permissions, limited disk space, or security software interference.',
      '\n',
      generateUnorderedSolutionList({
        title: 'To address this, you can:',
        solutions: [
          'Check if there is enough disk space and system resources are available.',
          selectBasedOnDirectoryPath({
            withoutDirectoryPath: 'Verify your access rights to the script\'s folder.',
            withDirectoryPath: (directory) => `Verify your access rights to the script's folder: "${directory}".`,
          }, diagnostics),
          [
            'Check if antivirus or security software has mistakenly blocked the script.',
            'Don\'t worry; privacy.sexy is secure, transparent, and open-source, but the scripts might still be mistakenly flagged by antivirus software.',
            'Temporarily disabling the security software may resolve this.',
          ].join(' '),
          selectBasedOnErrorContext({
            runningScript: 'Confirm that you have the necessary permissions to execute scripts on your system.',
            savingScript: 'Try saving the script to a different location.',
          }, information),
          generateTryDifferentSelectionAdvice(information),
          'If the problem persists, reach out to the community for further assistance.',
        ],
      }),
      '\n',
      generateTechnicalDetails(information),
    ].join('\n'),
  ];
}

function createAntivirusErrorDialog(
  information: ScriptErrorDetails,
  diagnostics: ScriptDiagnosticData | undefined,
): Parameters<Dialog['showError']> {
  const defenderSteps = generateDefenderSteps(information, diagnostics);
  return [
    'Possible Antivirus Script Block',
    [
      [
        'It seems your antivirus software might have removed the script.',
        'Don\'t worry; privacy.sexy is secure, transparent, and open-source, but the scripts might still be mistakenly flagged by antivirus software.',
      ].join(' '),
      '\n',
      selectBasedOnErrorContext({
        savingScript: generateOrderedSolutionList({
          title: 'To address this, you can:',
          solutions: [
            'Check your antivirus for any blocking notifications and allow the script.',
            'Disable antivirus or security software temporarily or add an exclusion.',
            'Save the script again.',
          ],
        }),
        runningScript: generateOrderedSolutionList({
          title: 'To address this, you can:',
          solutions: [
            selectBasedOnDirectoryPath({
              withoutDirectoryPath: 'Disable antivirus or security software temporarily or add an exclusion.',
              withDirectoryPath: (directory) => `Disable antivirus or security software temporarily or add a directory exclusion for scripts executed from: "${directory}".`,
            }, diagnostics),
            'Run the script again.',
          ],
        }),
      }, information),
      defenderSteps ? `\n${defenderSteps}\n` : '\n',
      [
        'It\'s important to re-enable your antivirus protection after resolving the issue for your security.',
        'For more guidance, refer to your antivirus documentation.',
      ].join(' '),
      '\n',
      generateUnorderedSolutionList({
        title: 'If the problem persists:',
        solutions: [
          generateTryDifferentSelectionAdvice(information),
          'Consider reporting this as a false positive to your antivirus provider.',
          'Review your antivirus logs for more details.',
          'Reach out to the community for further assistance.',
        ],
      }),
      '\n',
      generateTechnicalDetails(information),
    ].join('\n'),
  ];
}

interface SolutionListOptions {
  readonly solutions: readonly string[];
  readonly title: string;
}

function generateUnorderedSolutionList(options: SolutionListOptions) {
  return [
    options.title,
    ...options.solutions.map((step) => `- ${step}`),
  ].join('\n');
}

function generateTechnicalDetails(information: ScriptErrorDetails) {
  const maxErrorMessageCharacters = 100;
  const trimmedErrorMessage = information.errorMessage.length > maxErrorMessageCharacters
    ? `${information.errorMessage.substring(0, maxErrorMessageCharacters - 3)}...`
    : information.errorMessage;
  return `Technical Details: [${information.errorType}] ${trimmedErrorMessage}`;
}

function generateTryDifferentSelectionAdvice(information: ScriptErrorDetails) {
  return selectBasedOnErrorContext({
    runningScript: 'Run a different script selection to check if the problem is script-specific.',
    savingScript: 'Save a different script selection to check if the problem is script-specific.',
  }, information);
}

function selectBasedOnDirectoryPath<T>(
  options: {
    readonly withoutDirectoryPath: T,
    withDirectoryPath: (directoryPath: string) => T,
  },
  diagnostics: ScriptDiagnosticData | undefined,
): T {
  if (!diagnostics?.scriptsDirectoryAbsolutePath) {
    return options.withoutDirectoryPath;
  }
  return options.withDirectoryPath(diagnostics.scriptsDirectoryAbsolutePath);
}

function generateOrderedSolutionList(options: SolutionListOptions): string {
  return [
    options.title,
    ...options.solutions.map((step, index) => `${index + 1}. ${step}`),
  ].join('\n');
}

function generateDefenderSteps(
  information: ScriptErrorDetails,
  diagnostics: ScriptDiagnosticData | undefined,
): string | undefined {
  if (diagnostics?.currentOperatingSystem !== OperatingSystem.Windows) {
    return undefined;
  }
  return generateOrderedSolutionList({
    title: 'To handle false warnings in Defender:',
    solutions: [
      'Open "Virus & threat protection" via the "Start" menu.',
      'Open "Manage settings" under "Virus & threat protection settings" heading.',
      ...selectBasedOnErrorContext({
        savingScript: [
          'Disable "Real-time protection" or add an exclusion by selecting "Add or remove exclusions".',
        ],
        runningScript: selectBasedOnDirectoryPath({
          withoutDirectoryPath: [
            'Disable real-time protection or add exclusion for scripts.',
          ],
          withDirectoryPath: (directory) => [
            'Open "Add or remove exclusions" under "Add or remove exclusions".',
            `Add directory exclusion for "${directory}".`,
          ],
        }, diagnostics),
      }, information),
    ],
  });
}

function selectBasedOnErrorContext<T>(options: {
  readonly savingScript: T;
  readonly runningScript: T;
}, information: ScriptErrorDetails): T {
  if (information.errorContext === 'run') {
    return options.runningScript;
  }
  return options.savingScript;
}
