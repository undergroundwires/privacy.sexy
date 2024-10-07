import { exec } from 'node:child_process';
import { NodeElectronFileSystemOperations } from '@/infrastructure/FileSystem/NodeElectronFileSystemOperations';
import type { SystemOperations } from './SystemOperations';

/**
 * Thin wrapper for Node and Electron APIs.
 */
export const NodeElectronSystemOperations: SystemOperations = {
  fileSystem: NodeElectronFileSystemOperations,
  command: {
    exec,
  },
};
