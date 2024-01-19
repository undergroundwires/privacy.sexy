import { OperatingSystem } from '@/domain/OperatingSystem';

enum TouchSupportState {
  AlwaysSupported,
  MayBeSupported,
  NeverSupported,
}

const TouchSupportPerOperatingSystem: Record<OperatingSystem, TouchSupportState> = {
  [OperatingSystem.Android]: TouchSupportState.AlwaysSupported,
  [OperatingSystem.iOS]: TouchSupportState.AlwaysSupported,
  [OperatingSystem.iPadOS]: TouchSupportState.AlwaysSupported,
  [OperatingSystem.ChromeOS]: TouchSupportState.AlwaysSupported,
  [OperatingSystem.KaiOS]: TouchSupportState.MayBeSupported,
  [OperatingSystem.BlackBerry10]: TouchSupportState.AlwaysSupported,
  [OperatingSystem.BlackBerryOS]: TouchSupportState.AlwaysSupported,
  [OperatingSystem.BlackBerryTabletOS]: TouchSupportState.AlwaysSupported,
  [OperatingSystem.WindowsPhone]: TouchSupportState.AlwaysSupported,
  [OperatingSystem.Windows10Mobile]: TouchSupportState.AlwaysSupported,
  [OperatingSystem.Windows]: TouchSupportState.MayBeSupported,
  [OperatingSystem.Linux]: TouchSupportState.MayBeSupported,
  [OperatingSystem.macOS]: TouchSupportState.NeverSupported, // Consider Touch Bar as a special case
};

export function determineTouchSupportOptions(os: OperatingSystem): boolean[] {
  const state = TouchSupportPerOperatingSystem[os];
  switch (state) {
    case TouchSupportState.AlwaysSupported:
      return [true];
    case TouchSupportState.MayBeSupported:
      return [true, false];
    case TouchSupportState.NeverSupported:
      return [false];
    default:
      throw new Error(`Unknown state: ${TouchSupportState[state]}`);
  }
}
