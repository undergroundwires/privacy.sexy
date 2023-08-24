// This preload script serves as a placeholder to securely expose Electron APIs to the application.
// As of now, the application does not utilize any specific Electron APIs through this script.
import log from 'electron-log';
import { validateRuntimeSanity } from '@/infrastructure/RuntimeSanity/SanityChecks';

validateRuntimeSanity({
  validateMetadata: true,
});

// Do not remove [PRELOAD_INIT]; it's a marker used in tests.
log.info('[PRELOAD_INIT] Preload script successfully initialized and executed.');
