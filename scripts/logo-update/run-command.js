import { spawn } from 'node:child_process';

export async function runCommand(...args) {
  const command = args.join(' ');
  console.log(`Running command: ${command}`);
  await new Promise((resolve, reject) => {
    const process = spawn(command, { shell: true });
    process.stdout.on('data', (stdout) => {
      console.log(stdout.toString());
    });
    process.stderr.on('data', (stderr) => {
      console.error(stderr.toString());
    });
    process.on('error', (err) => {
      reject(err);
    });
    process.on('close', (exitCode) => {
      if (exitCode !== 0) {
        reject(new Error(`Process exited with non-zero exit code: ${exitCode}`));
      } else {
        resolve();
      }
      process.stdin.end();
    });
  });
}
