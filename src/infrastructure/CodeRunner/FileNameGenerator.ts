import { OperatingSystem } from '@/domain/OperatingSystem';

/**
 * Generates a timestamped filename specific to the given operating system.
 *
 * The filename includes:
 *  - A timestamp for uniqueness and easier auditability.
 *  - File extension based on the operating system.
 */
export function generateOsTimestampedFileName(
  currentOs: OperatingSystem,
  date = new Date(),
): string {
  const baseFileName = `run-${createTimeStampForFile(date)}`;
  const extension = FileExtensions[currentOs];
  return extension ? `${baseFileName}.${extension}` : baseFileName;
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
