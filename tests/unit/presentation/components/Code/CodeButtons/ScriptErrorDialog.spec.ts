import { describe, it, expect } from 'vitest';
import type { ScriptDiagnosticsCollector } from '@/application/ScriptDiagnostics/ScriptDiagnosticsCollector';
import { OperatingSystem } from '@/domain/OperatingSystem';
import type { Dialog } from '@/presentation/common/Dialog';
import { type ScriptErrorDetails, createScriptErrorDialog } from '@/presentation/components/Code/CodeButtons/ScriptErrorDialog';
import { expectExists } from '@tests/shared/Assertions/ExpectExists';
import { AllSupportedOperatingSystems } from '@tests/shared/TestCases/SupportedOperatingSystems';
import { ScriptDiagnosticsCollectorStub } from '@tests/unit/shared/Stubs/ScriptDiagnosticsCollectorStub';

describe('ScriptErrorDialog', () => {
  describe('handling different error types', () => {
    const testScenarios: readonly {
      readonly description: string,
      readonly givenErrorDetails: ScriptErrorDetails;
      readonly expectedDialogTitle: string;
    }[] = [
      {
        description: 'generic error when running',
        givenErrorDetails: createErrorDetails({
          isFileReadbackError: false,
          errorContext: 'run',
        }),
        expectedDialogTitle: 'Error Running Script',
      },
      {
        description: 'generic error when saving',
        givenErrorDetails: createErrorDetails({
          isFileReadbackError: false,
          errorContext: 'save',
        }),
        expectedDialogTitle: 'Error Saving Script',
      },
      {
        description: 'file readback failure',
        givenErrorDetails: createErrorDetails({ isFileReadbackError: true }),
        expectedDialogTitle: 'Possible Antivirus Script Block',
      },
      {
        description: 'script interruption',
        givenErrorDetails: createErrorDetails({
          errorContext: 'run',
          errorType: 'ExternalProcessTermination',
        }),
        expectedDialogTitle: 'Script Stopped',
      },
    ];
    testScenarios.forEach((
      { description, givenErrorDetails, expectedDialogTitle },
    ) => {
      it(`creates dialog for "${description}"`, async () => {
        // arrange
        const context = new CreateScriptErrorDialogTestSetup()
          .withDetails(givenErrorDetails);
        // act
        const dialog = await context.createScriptErrorDialog();
        // assert
        assertValidDialog(dialog);
      });
      it(`creates dialog for "${description}" with title "${expectedDialogTitle}"`, async () => {
        // arrange
        const context = new CreateScriptErrorDialogTestSetup()
          .withDetails(givenErrorDetails);
        // act
        const dialog = await context.createScriptErrorDialog();
        // assert
        const [actualDialogTitle] = dialog;
        expect(actualDialogTitle).to.equal(expectedDialogTitle);
      });
    });
  });

  describe('handling supported operating systems', () => {
    AllSupportedOperatingSystems.forEach((operatingSystem) => {
      it(`creates dialog for ${OperatingSystem[operatingSystem]}`, async () => {
        // arrange
        const diagnostics = new ScriptDiagnosticsCollectorStub()
          .withOperatingSystem(operatingSystem);
        const context = new CreateScriptErrorDialogTestSetup()
          .withDiagnostics(diagnostics);
        // act
        const dialog = await context.createScriptErrorDialog();
        // assert
        assertValidDialog(dialog);
      });
    });
  });

  describe('handling missing inputs', () => {
    it('creates dialog when diagnostics collector is undefined', async () => {
      const diagnostics = undefined;
      const context = new CreateScriptErrorDialogTestSetup()
        .withDiagnostics(diagnostics);
      // act
      const dialog = await context.createScriptErrorDialog();
      // assert
      assertValidDialog(dialog);
    });

    it('creates dialog when operating system is undefined', async () => {
      // arrange
      const undefinedOperatingSystem = undefined;
      const diagnostics = new ScriptDiagnosticsCollectorStub()
        .withOperatingSystem(undefinedOperatingSystem);
      const context = new CreateScriptErrorDialogTestSetup()
        .withDiagnostics(diagnostics);
      // act
      const dialog = await context.createScriptErrorDialog();
      // assert
      assertValidDialog(dialog);
    });

    it('creates dialog when script directory path is undefined', async () => {
      // arrange
      const undefinedScriptsDirectory = undefined;
      const diagnostics = new ScriptDiagnosticsCollectorStub()
        .withScriptDirectoryPath(undefinedScriptsDirectory);
      const context = new CreateScriptErrorDialogTestSetup()
        .withDiagnostics(diagnostics);
      // act
      const dialog = await context.createScriptErrorDialog();
      // assert
      assertValidDialog(dialog);
    });
  });

  describe('handling all error contexts', () => {
    const possibleContexts: ScriptErrorDetails['errorContext'][] = ['run', 'save'];
    possibleContexts.forEach((dialogContext) => {
      it(`creates dialog for '${dialogContext}' context`, async () => {
        // arrange
        const undefinedScriptsDirectory = undefined;
        const diagnostics = new ScriptDiagnosticsCollectorStub()
          .withScriptDirectoryPath(undefinedScriptsDirectory);
        const context = new CreateScriptErrorDialogTestSetup()
          .withDiagnostics(diagnostics);
        // act
        const dialog = await context.createScriptErrorDialog();
        // assert
        assertValidDialog(dialog);
      });
    });
  });
});

function assertValidDialog(dialog: Parameters<Dialog['showError']>): void {
  expectExists(dialog);
  const [title, message] = dialog;
  expectExists(title);
  expect(title).to.have.length.greaterThan(1);
  expectExists(message);
  expect(message).to.have.length.greaterThan(1);
}

function createErrorDetails(partialDetails?: Partial<ScriptErrorDetails>): ScriptErrorDetails {
  const defaultDetails: ScriptErrorDetails = {
    errorContext: 'run',
    errorType: 'UnsupportedPlatform',
    errorMessage: 'test error message',
    isFileReadbackError: false,
  };
  return {
    ...defaultDetails,
    ...partialDetails,
  };
}

class CreateScriptErrorDialogTestSetup {
  private details: ScriptErrorDetails = createErrorDetails();

  private diagnostics:
  ScriptDiagnosticsCollector | undefined = new ScriptDiagnosticsCollectorStub();

  public withDetails(details: ScriptErrorDetails): this {
    this.details = details;
    return this;
  }

  public withDiagnostics(diagnostics: ScriptDiagnosticsCollector | undefined): this {
    this.diagnostics = diagnostics;
    return this;
  }

  public createScriptErrorDialog() {
    return createScriptErrorDialog(
      this.details,
      this.diagnostics,
    );
  }
}
