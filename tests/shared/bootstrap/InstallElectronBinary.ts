import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

/*
  Electron downloads its binary on first import. Without this one-time install, parallel test
  workers importing it race to extract into the same directory and fail with "File exists".
  The installer exits immediately when the matching binary is already present.
*/
export default function installElectronBinary(): void {
  const require = createRequire(import.meta.url);
  const installer = join(dirname(require.resolve('electron')), 'install.js');
  execFileSync(process.execPath, [installer], { stdio: 'inherit' });
}
