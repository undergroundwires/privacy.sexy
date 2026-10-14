# Windows cleanup fixture runner

This is an explicitly opted-in **disposable VMware guest** test, not part of local test execution.
Never run the PowerShell harness or a catalog payload on a personal/development installation.
The regular safe Vitest profile only compiles inert payload text.

## 1. Generate an inert payload on the development host

Run from the repository root in PowerShell. Use an existing output directory:

```powershell
$env:PRIVACY_SEXY_VM_PAYLOAD = "$PWD\.omo\windows-cleanup-vm-payload.json"
node node_modules/vitest/vitest.mjs run --config vitest.safe.config.ts tests/integration/application/Application/Loader/Collections/WindowsCleanupVmPayload.spec.ts
Remove-Item Env:\PRIVACY_SEXY_VM_PAYLOAD
```

This compiles the current Windows helpers into JSON. It does not execute them.
Copy that JSON together with `Test-WindowsCleanup.ps1`, `WindowsCleanupVmFixtures.ps1`,
`WindowsCleanupVmAssertions.ps1`, and `WindowsCleanupVmToken.ps1` to a dedicated directory inside the VM.
Use authenticated SSH/SCP or another trusted transfer mechanism. Do not copy private SSH keys into the VM.

## 2. Run inside the disposable VM

Take a snapshot first. Verify the guest's computer name and use an elevated PowerShell session.
Replace `YOUR-VERIFIED-VM-NAME` with that exact name; do not substitute the current machine's name automatically.

```powershell
powershell.exe -NoProfile -NonInteractive -ExecutionPolicy Bypass -File .\Test-WindowsCleanup.ps1 -PayloadPath .\windows-cleanup-vm-payload.json -ExpectedComputerName YOUR-VERIFIED-VM-NAME -AllowFixtureDeletion
```

`-ExecutionPolicy Bypass` applies only to this test process, not the machine's execution policy.
To run a single scenario, append `-Case normal`, `-Case repair-file`, or another exported case identifier.
The command returns nonzero for a failed assertion, missing result, or incomplete fixture teardown.
The JSON summary includes per-case outcomes, operation counts, progress observations, and cleanup status.

## Safety and interpretation

- The harness checks explicit consent, the supplied machine name, VMware manufacturer, and elevation before creating fixtures.
- Each run creates a unique temporary tree. External link targets are separate, but still inside that owned fixture tree.
- Handles are closed, recorded fixture ACLs are restored, and recorded junctions/symlinks are unlinked before final fixture removal.
- No background jobs, test services, scheduled tasks, or detached processes are created by the harness.
- Native permission-repair utilities invoked by the generated payload run synchronously on fixture paths only.
- SSH tokens may enable backup/restore privileges that bypass ACL checks. The harness disables just those privileges
  in its own process during payload execution and restores their original state afterward.
- Measurements use a stopwatch only for observation. There is no guessed operation timeout or performance pass threshold.
- A stuck OS call is still possible. Do not interpret this suite as proving that Windows can never hang.

**The guards and fixture marker are not a security sandbox for untrusted JSON.** Execute only freshly generated,
reviewed payloads from a trusted checkout. A supplied payload contains executable PowerShell code.

The suite tests decoded PowerShell bodies, not the complete batch/elevation/desktop-launch workflow.
Its OneDrive fixture tests the preservation callback independently of the registry pre-check.
Keep those coverage boundaries when reporting results.

After testing, remove the uploaded test files. Existing SSH keys and firewall access can remain for future VM testing.
If teardown reports a remaining fixture root, inspect the reported errors before removing only that owned directory or reverting the snapshot.

## npm installer helper regression probe

`Test-NpmInstallHelper.ps1` separately tests the repository's `scripts/npm-install.js` CLI.
Copy a trusted portable `node.exe`, the current `npm-install.js`, and that harness into the disposable VM.

```powershell
powershell.exe -NoProfile -NonInteractive -ExecutionPolicy Bypass -File .\Test-NpmInstallHelper.ps1 -NodePath .\node.exe -ScriptPath .\npm-install.js -ExpectedComputerName YOUR-VERIFIED-VM-NAME -AllowFixtureDeletion
```

The harness compiles a fake `npm.exe` that records the requested working directory and arguments.
It does not install packages. Six cases verify target-directory selection, `--fresh` isolation,
help without installation, and rejection of unknown or incomplete options.
Its `finally` restores the process environment and working directory and removes its owned fixture tree.
