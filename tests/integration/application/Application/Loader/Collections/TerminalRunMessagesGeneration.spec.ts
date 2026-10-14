import {
  beforeAll, describe, expect, it,
} from 'vitest';
import { loadApplicationComposite } from '@/application/Application/Loader/CompositeApplicationLoader';
import { UserScriptGenerator } from '@/application/Context/State/Code/Generation/UserScriptGenerator';
import { UserSelectedScript } from '@/application/Context/State/Selection/Script/UserSelectedScript';
import type { Application } from '@/domain/Application/Application';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { BASE_APP_COMPILATION_TIMEOUT_MS } from '@tests/shared/TestTiming';

const WINDOWS_RUN_BANNER = [
  'echo(',
  'echo(privacy.sexy - Running selected actions',
  'echo(Review each action below for errors or warnings.',
].join('\n');

const UNIX_RUN_BANNER = [
  "printf '%s\\n' ''",
  "printf '%s\\n' 'privacy.sexy - Running selected actions'",
  "printf '%s\\n' 'Review each action below for errors or warnings.'",
].join('\n');

const WINDOWS_COMPLETION_SUMMARY = [
  'echo(',
  'echo Reached the end of 1 selected actions. Review warnings/errors above.',
].join('\n');

const UNIX_COMPLETION_SUMMARY = [
  "printf '%s\\n' ''",
  "printf '%s\\n' 'Reached the end of 1 selected actions. Review warnings/errors above.'",
].join('\n');

const GENERATION_SCENARIOS = [
  {
    name: 'Windows',
    operatingSystem: OperatingSystem.Windows,
    elevationCompletion: 'setlocal EnableExtensions DisableDelayedExpansion',
    waitCommand: 'pause',
    runBanner: WINDOWS_RUN_BANNER,
    completionSummary: WINDOWS_COMPLETION_SUMMARY,
  },
  {
    name: 'Linux',
    operatingSystem: OperatingSystem.Linux,
    elevationCompletion: 'export HOME="/home/',
    waitCommand: 'read -n 1 -s',
    runBanner: UNIX_RUN_BANNER,
    completionSummary: UNIX_COMPLETION_SUMMARY,
  },
  {
    name: 'macOS',
    operatingSystem: OperatingSystem.macOS,
    elevationCompletion: '\nfi\n',
    waitCommand: 'read -n 1 -s',
    runBanner: UNIX_RUN_BANNER,
    completionSummary: UNIX_COMPLETION_SUMMARY,
  },
] as const;

const UNIX_COLLECTIONS = [
  { name: 'Linux', operatingSystem: OperatingSystem.Linux },
  { name: 'macOS', operatingSystem: OperatingSystem.macOS },
] as const;

// Generate artifacts only; these generated scripts are never executed on the test host.
describe('Terminal run message generation', () => {
  let application: Application;

  beforeAll(() => {
    application = loadApplicationComposite();
  }, BASE_APP_COMPILATION_TIMEOUT_MS);

  function generateCode(operatingSystem: OperatingSystem): string {
    const collection = application.getCollection(operatingSystem);
    const [firstScript] = collection.getAllScripts();
    if (firstScript === undefined) {
      throw new Error(`Collection ${OperatingSystem[operatingSystem]} must contain a script.`);
    }
    return new UserScriptGenerator().buildCode(
      [new UserSelectedScript(firstScript, false)],
      collection.scriptMetadata,
    ).code.replaceAll('\r\n', '\n');
  }

  it.each(GENERATION_SCENARIOS)('places the run banner after elevation for $name', ({
    operatingSystem,
    elevationCompletion,
    runBanner,
  }) => {
    // arrange
    const generatedCode = generateCode(operatingSystem);

    // act
    const runBannerPosition = generatedCode.indexOf(runBanner);
    const elevationCompletionPosition = generatedCode.indexOf(elevationCompletion);

    // assert
    expect(elevationCompletionPosition).toBeGreaterThan(-1);
    expect(runBannerPosition).toBeGreaterThan(elevationCompletionPosition);
  });

  it.each(GENERATION_SCENARIOS)('places the counted completion summary before the existing wait for $name', ({
    operatingSystem,
    completionSummary,
    waitCommand,
  }) => {
    // arrange
    const generatedCode = generateCode(operatingSystem);

    // act
    const completionSummaryPosition = generatedCode.indexOf(completionSummary);
    const waitPosition = generatedCode.indexOf(waitCommand, completionSummaryPosition);

    // assert
    expect(completionSummaryPosition).toBeGreaterThan(-1);
    expect(waitPosition).toBeGreaterThan(completionSummaryPosition);
  });

  it.each(GENERATION_SCENARIOS)('keeps obsolete completion notices out of $name metadata', ({ operatingSystem }) => {
    // arrange
    const { endCode } = application.getCollection(operatingSystem).scriptMetadata;
    // act
    const hasObsoleteCompletionNotice = endCode.includes('Finished running selected actions.')
      || endCode.includes('Review the output above for errors or warnings.');
    // assert
    expect(hasObsoleteCompletionNotice).toBe(false);
  });

  it.each(UNIX_COLLECTIONS)('does not claim the $name collection is hardened or use emoji', ({ operatingSystem }) => {
    // arrange
    const { endCode } = application.getCollection(operatingSystem).scriptMetadata;

    // act
    const containsObsoleteSuccessMessage = endCode.includes('Your privacy and security is now hardened');

    // assert
    expect(containsObsoleteSuccessMessage).toBe(false);
    expect(endCode).not.toMatch(/[\u{1F300}-\u{1FAFF}]/u);
  });
});
