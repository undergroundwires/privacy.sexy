import { OperatingSystem } from '@/domain/OperatingSystem';
import { RuntimeEnvironment } from '@/infrastructure/RuntimeEnvironment/RuntimeEnvironment';
import { CurrentEnvironment } from '@/infrastructure/RuntimeEnvironment/RuntimeEnvironmentFactory';
import { FilenameGenerator } from './FilenameGenerator';

/**
 * Generates a timestamped filename specific to the given operating system.
 *
 * The filename includes:
 *  - A timestamp for uniqueness and easier auditability.
 *  - File extension based on the operating system.
 */
export class OsTimestampedFilenameGenerator implements FilenameGenerator {
  private readonly currentOs?: OperatingSystem;

  constructor(
    environment: RuntimeEnvironment = CurrentEnvironment,
  ) {
    this.currentOs = environment.os;
  }

  public generateFilename(
    date = new Date(),
  ): string {
    const baseFileName = `run-${createTimeStampForFile(date)}`;
    const extension = this.currentOs === undefined ? undefined : FileExtensions[this.currentOs];
    return extension ? `${baseFileName}.${extension}` : baseFileName;
  }
}

const FileExtensions: Partial<Record<OperatingSystem, string>> = {
  // '.bat' for Windows batch files; required for executability.
  [OperatingSystem.Windows]: 'bat',

  // '.sh' for Unix-like systems; enhances recognition as a shell script
  [OperatingSystem.macOS]: 'sh',
  [OperatingSystem.Linux]: 'sh',
};

/** Generates a timestamp for the filename in 'YYYY-MM-DD_HH-MM-SS' format. */
function createTimeStampForFile(date: Date): string {
  return date
    .toISOString()
    .replace(/T/, '_')
    .replace(/:/g, '-')
    .replace(/\..+/, '');
}
