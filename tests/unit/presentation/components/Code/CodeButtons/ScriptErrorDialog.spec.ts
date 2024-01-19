import { describe, it, expect } from 'vitest';
import { ScriptDiagnosticsCollector } from '@/application/ScriptDiagnostics/ScriptDiagnosticsCollector';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { Dialog } from '@/presentation/common/Dialog';
import { ScriptErrorDetails, createScriptErrorDialog } from '@/presentation/components/Code/CodeButtons/ScriptErrorDialog';
import { expectExists } from '@tests/shared/Assertions/ExpectExists';
import { AllSupportedOperatingSystems } from '@tests/shared/TestCases/SupportedOperatingSystems';
import { ScriptDiagnosticsCollectorStub } from '@tests/unit/shared/Stubs/ScriptDiagnosticsCollectorStub';

describe('ScriptErrorDialog', () => {
  describe('handles readback error type', () => {
    it('handles file readback error', async () => {
      // arrange
      const errorDetails = createErrorDetails({ isFileReadbackError: true });
      const context = new CreateScriptErrorDialogTestSetup()
        .withDetails(errorDetails);
      // act
      const dialog = await context.createScriptErrorDialog();
      // assert
      assertValidDialog(dialog);
    });
    it('handles generic error', async () => {
      // arrange
      const errorDetails = createErrorDetails({ isFileReadbackError: false });
      const context = new CreateScriptErrorDialogTestSetup()
        .withDetails(errorDetails);
      // act
      const dialog = await context.createScriptErrorDialog();
      // assert
      assertValidDialog(dialog);
    });
  });

  describe('handles supported operatingSystems', () => {
    AllSupportedOperatingSystems.forEach((operatingSystem) => {
      it(`${OperatingSystem[operatingSystem]}`, async () => {
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

  it('handles undefined diagnostics collector', async () => {
    const diagnostics = undefined;
    const context = new CreateScriptErrorDialogTestSetup()
      .withDiagnostics(diagnostics);
    // act
    const dialog = await context.createScriptErrorDialog();
    // assert
    assertValidDialog(dialog);
  });

  it('handles undefined operating system', async () => {
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

  it('handles directory path', async () => {
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

  describe('handles all contexts', () => {
    const possibleContexts: ScriptErrorDetails['errorContext'][] = ['run', 'save'];
    possibleContexts.forEach((dialogContext) => {
      it(`${dialogContext} context`, async () => {
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
    errorType: 'test-error-type',
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
