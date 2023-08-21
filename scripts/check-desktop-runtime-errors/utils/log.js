export const LOG_LEVELS = Object.freeze({
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
});

export function log(message, level = LOG_LEVELS.INFO) {
  const timestamp = new Date().toISOString();
  const config = LOG_LEVEL_CONFIG[level] || LOG_LEVEL_CONFIG[LOG_LEVELS.INFO];
  const formattedMessage = `[${timestamp}][${config.color}${level}${COLOR_CODES.RESET}] ${message}`;
  config.method(formattedMessage);
}

export function die(message) {
  log(message, LOG_LEVELS.ERROR);
  process.exit(1);
}

const COLOR_CODES = {
  RESET: '\x1b[0m',
  LIGHT_RED: '\x1b[91m',
  YELLOW: '\x1b[33m',
  LIGHT_BLUE: '\x1b[94m',
};

const LOG_LEVEL_CONFIG = {
  [LOG_LEVELS.INFO]: {
    color: COLOR_CODES.LIGHT_BLUE,
    method: console.log,
  },
  [LOG_LEVELS.WARN]: {
    color: COLOR_CODES.YELLOW,
    method: console.warn,
  },
  [LOG_LEVELS.ERROR]: {
    color: COLOR_CODES.LIGHT_RED,
    method: console.error,
  },
};
