export const IconNames = [
  'magnifying-glass',
  'copy',
  'circle-info',
  'user-secret',
  'tag',
  'github',
  'face-smile',
  'globe',
  'desktop',
  'xmark',
  'battery-half',
  'battery-full',
  'folder',
  'folder-open',
  'left-right',
  'file-arrow-down',
  'floppy-disk',
  'play',
] as const;

export type IconName = typeof IconNames[number];
