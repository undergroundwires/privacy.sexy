// This file is used to securely expose Electron APIs to the application.

import { validateRuntimeSanity } from '@/infrastructure/RuntimeSanity/SanityChecks';
import { ElectronLogger } from '@/infrastructure/Log/ElectronLogger';
import { connectApisWithContextBridge } from './ContextBridging/ApiContextBridge';

validateRuntimeSanity({
  // Validate metadata as a preventive measure for fail-fast,
  // even if it's not currently used in the preload script.
  validateEnvironmentVariables: true,

  // The preload script cannot access variables on the window object.
  validateWindowVariables: false,
});

connectApisWithContextBridge();

// Do not remove [PRELOAD_INIT]; it's a marker used in tests.
ElectronLogger.info('[PRELOAD_INIT] Preload script successfully initialized and executed.');
