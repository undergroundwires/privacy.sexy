# Windows cleanup without guessed timeouts

## Scope

The permanent file-cleanup helpers now process directory trees incrementally.
This includes `Clear previous Windows installations` (`Windows.old`) and the file-cleanup portion of
`Clear Windows update files` (`SoftwareDistribution`). The shared `DeleteGlob` implementation also serves
`DeleteDirectory`, `ClearDirectoryContents`, and `DeleteFiles`.

This addresses avoidable silent work and repeated traversal. **It is not a guarantee that every script,
Windows API, native utility, filesystem driver, or device will always finish.**
The user's historical incident was not reproduced, and its exact cause is unknown.
No privacy command or cleanup operation was run on the development computer.

## What changed

Previously, cleanup could perform recursive ownership and permission sweeps, buffer their output,
collect every descendant, sort the entire list, and then invoke recursive deletion on each item.
Large trees could therefore appear idle before deletion began. Retained or failed subtrees could be traversed again.

The permanent-deletion engine now:

- Resolves starting paths without a recursive search.
- Enumerates one directory's immediate children at a time and processes descendants before their parent.
- Schedules each normalized path once, rather than using recursive function calls or sorting a whole-tree list.
- Preserves the selected root when clearing only directory contents.
- Checks selected roots and their lexical ancestors, plus each discovered item, for reparse points.
  It retains these links instead of descending through them or changing their permissions.
- Uses literal paths after glob resolution. Brackets in discovered filenames are not interpreted again as wildcards.
- Deletes files individually and deletes directories only if empty, using file/directory-specific APIs.
  There is no recursive fallback or retry-until-empty loop.
- Sends routine path-level progress for inspection, enumeration, deletion, and permission repair to the PowerShell verbose stream.
  The normal output remains compact; PowerShell hosts that enable the verbose stream can show this troubleshooting detail.
- Reports separate deleted, already-absent, deliberately preserved, reparse-point, and failure counts.
  Failed operations or skipped reparse points produce an explicit incomplete-cleanup warning.

File-only cleanup still excludes directories. The OneDrive preservation callback still retains files and nonempty
directories; its emptiness check now considers immediate children, including hidden/system items, without a recursive scan.
Reversible `SoftDeleteFiles` and `IterateGlob` retain their traversal and restoration behavior;
their routine progress messages now use the verbose stream.

## Permission repair is cause-based, not time-based

When `grantPermissions` is selected, a recognized access-denied error may cause one nonrecursive
`takeown` and `icacls` repair pair for that path. Only then can the failed operation be attempted once more.
The path is marked as attempted before invoking either utility.
Native output is captured on each call. A nonzero `takeown.exe` or `icacls.exe` exit code reports the tool, path,
exit code, and captured native details; successful native calls remain quiet. Piped input ends at EOF rather than
leaving an interactive input source.

There are no recursive `/r` or `/t` sweeps, localized `choice` probes, ACL resets, or repairs of unrelated ancestors.
Without `grantPermissions`, ownership and ACLs are not changed. Read-only attributes may still be cleared for deletion,
as with the previous force-delete behavior.

This deliberately differs from the previous recursive `takeown /d` behavior.
An explicit deny entry may remain effective after an additive grant. Cleanup then reports failure and continues with other items.
If metadata cannot establish that a path is eligible, cleanup retains it rather than repairing an unknown target.
Permission changes made to items that ultimately remain are not automatically undone.

## Bounds and limits

For a stable finite tree, **assuming each filesystem/native call returns**, the engine schedules each path once,
lists a directory once plus at most one permission-repair retry, and never retries deletion of an entire subtree.
The OneDrive callback can perform one additional immediate-child check.
These are bounds on repeated work, not assumptions about elapsed time.

A single very wide directory can still require substantial enumeration time and memory.
The pending work and visited-path set are not constant-memory structures.
Files appearing after enumeration may leave a parent nonempty; the engine reports that outcome instead of chasing changes indefinitely.
Path-based reparse checks do not eliminate concurrent replacement races. Runtime behavior on unusual filesystems is unverified.

Other waits are outside this change: service stop/start waits, installers, application profiles,
reversible soft deletion, and OS/native calls can still block.
In particular, `SoftwareDistribution` cleanup still has its existing service-management steps.
The batch footer's final `pause` intentionally waits for a key; it is not a cleanup hang.

The existing best-effort batch behavior is retained. The desktop app observes its launcher,
not every elevated child operation, and the batch footer can exit successfully despite warnings.
Inspect the cleanup summary rather than treating app launch or batch exit alone as proof of complete deletion.
Ctrl+C can request cancellation, but prompt cancellation of a blocked OS/native call is not guaranteed.
Cancellation does not roll back deleted files or guarantee that later service-restoration steps run.

## Validation

Local validation is deliberately non-executing:

- Generation regressions cover traversal shape, root retention, file-only exclusion, callbacks,
  permission opt-in, literal paths, quiet routine output, retained failure/reparse diagnostics, absence of timers,
  and complete downloadable artifacts.
- All catalogs are compiled by the actual application loader, including the guarded OneDrive caller.
- In the earlier syntax validation, generated PowerShell was parsed as text, never invoked. Windows PowerShell 5.1.26100.9444 parsed
  4,965 command bodies without syntax errors, including 135 emitted cleanup calls.
- Before the quiet-output changes, the longest generated cleanup command was 7,847 characters, below the existing 8,191-character batch-line limit.
  This is measured before `cmd.exe` expands environment variables; unusually long expanded paths remain unverified.

These local checks do not prove filesystem or ACL behavior. The historical authorized Windows 11 VM run
passed all 21 fixture cases, including deep/wide trees, explicit denies, successful and unsuccessful permission repair,
locked files, links and ancestor junctions, changing trees, and preservation callbacks.
It predates the quiet-output changes. See the [VM validation report](windows-cleanup-vm-validation.md) for measured results and limitations.
Cancellation, genuinely stalled OS calls, other Windows builds, and real Windows Update service workflows remain unverified.
Do not perform destructive runtime tests on a personal installation.

## References

- [Microsoft: takeown](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/takeown)
- [Microsoft: icacls](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/icacls)
- [Directory.Delete](https://learn.microsoft.com/en-us/dotnet/api/system.io.directory.delete?view=netframework-4.8)
- [File.Delete](https://learn.microsoft.com/en-us/dotnet/api/system.io.file.delete?view=netframework-4.8)
- [PowerShell 5.1 Remove-Item notes](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.management/remove-item?view=powershell-5.1#notes):
  `-Confirm:$false` does not suppress the nonempty-directory prompt.
