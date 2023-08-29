export enum LogLevel {
  Info,
  Warn,
  Error,
}

export function log(message: string, level = LogLevel.Info): void {
  const timestamp = new Date().toISOString();
  const config = LOG_LEVEL_CONFIG[level] || LOG_LEVEL_CONFIG[LogLevel.Info];
  const logLevelText = `${getColorCode(config.color)}${LOG_LEVEL_LABELS[level]}${getColorCode(TextColor.Reset)}`;
  const formattedMessage = `[${timestamp}][${logLevelText}] ${message}`;
  config.method(formattedMessage);
}

export function die(message: string): never {
  log(message, LogLevel.Error);
  return process.exit(1);
}

enum TextColor {
  Reset,
  LightRed,
  Yellow,
  LightBlue,
}

function getColorCode(color: TextColor): string {
  return COLOR_CODE_MAPPING[color];
}

const LOG_LEVEL_LABELS: {
  readonly [K in LogLevel]: string;
} = {
  [LogLevel.Info]: 'INFO',
  [LogLevel.Error]: 'ERROR',
  [LogLevel.Warn]: 'WARN',
};

const COLOR_CODE_MAPPING: {
  readonly [K in TextColor]: string;
} = {
  [TextColor.Reset]: '\x1b[0m',
  [TextColor.LightRed]: '\x1b[91m',
  [TextColor.Yellow]: '\x1b[33m',
  [TextColor.LightBlue]: '\x1b[94m',
};

interface ColorLevelConfig {
  readonly color: TextColor;
  readonly method: (...data: unknown[]) => void;
}

const LOG_LEVEL_CONFIG: {
  readonly [K in LogLevel]: ColorLevelConfig;
} = {
  [LogLevel.Info]: {
    color: TextColor.LightBlue,
    method: console.log,
  },
  [LogLevel.Warn]: {
    color: TextColor.Yellow,
    method: console.warn,
  },
  [LogLevel.Error]: {
    color: TextColor.LightRed,
    method: console.error,
  },
};
