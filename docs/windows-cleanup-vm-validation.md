# Windows cleanup VM validation

Date: 2026-09-14 UTC.

## Result

**21 of 21 fixture cases passed** on an authorized VMware Windows 11 Enterprise guest,
Windows build 26200, using Windows PowerShell 5.1.26100.7920 with an elevated token.
No production cleanup defect was found in these cases.
The test harness required a correction to account for the SSH token's enabled backup/restore privileges.

Only newly created temporary fixture trees were cleaned. No catalog command was executed on the development host.
The VM's real Windows.old, SoftwareDistribution, user data, services, and registry settings were not modified by these tests.
The fixture runner reported successful teardown with no cleanup errors.

## Runtime coverage

| Scenario | Observed result |
| --- | --- |
| Normal tree with spaces, brackets, Unicode, hidden/system/read-only entries | All 5 entries deleted |
| Clear directory contents | 4 entries deleted; selected root retained |
| File-only cleanup | 2 files deleted; directory and its child retained |
| Empty directory | Deleted without prompting |
| Missing directory | Reported absent, not failed or deleted |
| Multiple wildcard roots | Both matching trees removed; unmatched sibling retained |
| Deep/wide tree | 1,202 files and 83 directories removed |
| Locked file | Locked file retained; independent file deleted; no permission repair |
| Explicit delete denial without repair | File retained; ACL unchanged |
| Explicit delete denial with repair enabled | One repair attempt; explicit denial remained; failure reported |
| Recoverable file permission restriction | One repair attempt; file and parent deleted |
| Explicit enumeration denial | One repair attempt; denied subtree retained; independent sibling processed |
| Recoverable enumeration restriction | One repair attempt; subtree and parent deleted |
| Enumeration repair followed by deletion denial on the same directory | Still only one repair attempt for that path |
| External junction plus cyclic junction | Both links retained; external sentinels unchanged |
| Selected root is a junction | No traversal or deletion |
| Selected root has a junction ancestor | No traversal or deletion |
| File symbolic link | Link and target retained; independent file deleted |
| Injected callback using `continue` | Protected file retained; independent entries processed; callback count correct |
| File created after enumeration | New file retained; one parent-deletion failure; no rescan |
| Production OneDrive preservation callback | User files and hidden content retained; empty directory deleted |

Expected failures, such as locked or explicitly denied files, count as passing tests only when the
filesystem state, failure counters, and retry behavior match the scenario's assertions.
They do not count as successful deletion.

## Progress evidence

In a measured passing deep/wide run:

- 1,285 entries were deleted in approximately **3.26 seconds**.
- The first deletion was observed after approximately **40.7 milliseconds**.
- Only **1 of 83 directories** had been enumerated when that first deletion was observed.

This demonstrates incremental work on that fixture rather than a whole-tree prescan.
These are observed measurements, not deadlines, performance promises, or comparisons against the original implementation.
No elapsed-time threshold controls the generated cleanup code or determines fixture success.
The assertion also requires all 83 enumeration events and a positive enumeration count before the first deletion,
so missing progress instrumentation cannot produce a false pass. A negative-control probe confirmed rejection of zero enumeration evidence.

## SSH token correction

The first run passed 15 cases; the six ACL cases did not encounter their intended access denials.
Inspection with `whoami /priv` showed every listed privilege enabled in the SSH session,
including `SeBackupPrivilege` and `SeRestorePrivilege`.

The fixture harness now temporarily disables those two privileges in its own process before invoking each payload,
then restores their original attributes in `finally`. This does not change the account's rights, group membership,
machine security policy, or another process's token.
With that change, all six ACL scenarios exercised the intended denial/repair paths and passed.
Other token privileges remain unchanged; this is not a complete simulation of every interactive logon token.

## Evidence boundary

The local exporter uses the real collection compiler. The VM executes the decoded generated PowerShell bodies,
with fixture-specific path parameters, the default `Continue` error preference, and a trailing counter observation.
It does not execute downloaded `.bat` launchers or the desktop application's elevation/launch path.
The OneDrive test uses its actual preservation callback, not its preceding user-shell-folder registry guard.

Not established by this run:

- Exact cause of the user's historical stall.
- Full `cmd.exe` quoting/environment expansion or batch-footer behavior.
- Actual Windows Update service stop/start and recovery workflows.
- Cancellation, genuinely hung drivers/native calls, hostile concurrent path replacement, or unbounded live trees.
- Other Windows versions, filesystems, network shares, long-path configurations, or the rest of the privacy catalog.

See [runner instructions](../tests/vm/README.md) and [cleanup behavior and limits](windows-cleanup-behavior.md).
