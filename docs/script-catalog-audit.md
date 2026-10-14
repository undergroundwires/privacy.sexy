# Script catalog audit

Audit date: 2026-09-13.

## Verdict and safety boundary

Confirmed defects were corrected, and all three catalogs passed the structural checks below.
**This does not certify that every command is current, safe, or effective on every supported system.**
Vendor-documentation review was targeted, not an exhaustive revalidation of every policy and application path.

No privacy command, generated script, registry operation, service change, package removal,
or cleanup operation was executed on the development computer.
No desktop application or local web server was launched.
Validation used catalog data, generated text, syntax parsers, the reviewed safe test profile, and compilation.
The Python schema validator's dependencies were installed in its repository-local virtual environment.
Existing unrelated maintenance changes were preserved.

## Inventory and upstream freshness

| Catalog | Scripts | Shared helpers |
| --- | ---: | ---: |
| Windows | 920 | 72 |
| macOS | 144 | 8 |
| Linux | 131 | 22 |
| Total | 1,195 | 102 |

At the audit date, upstream `master` still pointed to
[`7b956f3d8c8b80bbb2b5d0f77912431bf98fdafb`](https://github.com/undergroundwires/privacy.sexy/commit/7b956f3d8c8b80bbb2b5d0f77912431bf98fdafb),
dated 2025-04-18, matching this checkout's starting revision.
No later upstream commits were returned for the three catalog files.
Matching upstream is not evidence of compatibility with newer operating systems or applications.

## Corrections

### Windows

- Corrected the SMB server registry value from `SMBv1` to the documented `SMB1` [1].
  Apply and revert now target the same correct value. Existing feature/default-revert behavior remains.
- Removed the unintended batch argument `%1` from `wevtutil.exe cl`, leaving the enumerated log name [2].
- Restricted Cryptographic Services diagnostic cleanup to `catroot2\dberr.txt`.
  Database, checkpoint, reserved-log, and transaction-log targets are no longer part of this routine cleanup.
- Fixed invalid generated PowerShell in OneDrive's revert path.
  Its evaluated registry-data expression now satisfies the shared helper's single-line requirement.
  The parse-only audit detected three syntax errors in this artifact before the correction.
- Corrected the two obsolete Edge telemetry policies' supported range to versions 77 through 88 [3] [4].
  Their script identifiers and revert paths remain available, but they are no longer recommended.
- Updated current Edge diagnostic-data documentation and Windows 10 applicability [5].
  No redundant URL-reporting policy was added: that separate setting applies only when optional diagnostics are enabled [6].
- Replaced the blanket SoftwareDistribution cleanup reassurance with explicit update-state, download,
  history-loss, active-update, and service-coordination warnings.
- Clarified that SMB revert uses configured defaults rather than restoring a captured prior configuration.

### Linux

- Corrected GNOME Web's filesystem-root cache typo and duplicated home-directory segment in the Snap path.
  Quoted fixed path components while preserving wildcard expansion.
- Replaced relative `root/.cache` cleanup with absolute `/root/.cache` enumeration under `sudo`.
  `find` excludes the cache directory itself and passes each entry as a separate argument.
  Documented that this action still uses default cache locations, not a customized `XDG_CACHE_HOME`.
- Initialized the cron job name in standalone revert output.
- Removed the stray `2` argument from Azure CLI logout's output redirection.
- Corrected swapped Snap/Flatpak comments for Thunderbird paths.
- Repaired the unused Firefox database helper: honor its database/table arguments, resolve the user's home,
  commit deletion before reporting success, close the connection, and remove blank lines rejected by the compiler.
  This helper is not currently called by a catalog action; its generation is covered by a regression fixture.

### macOS

- Fixed Gradle and Dropbox guards that treated quoted `~` as a literal directory name.
- Quoted Homebrew's cache-directory command substitution.
- Fixed the shared deletion helper's splitting of paths such as `Library/Application Support`.
  A subshell-local empty `IFS` preserves pathname expansion without field splitting [7],
  and `--` prevents resulting operands from becoming `rm` options.
- Corrected Parallels documentation's `1`/`no` contradiction and stated the limits of its legacy preferences [8].
  Its existing fallback revert value was not changed speculatively.

## Validation evidence

| Check | Result | What it establishes |
| --- | --- | --- |
| YAML schema validator | All 3 catalogs passed | Schema conformance |
| Real application loader and compiler | All 1,195 scripts loaded | Template compilation and built-in code constraints |
| Safe Vitest profile | 255 files, 2,374 tests passed | Existing safe coverage plus 15 new generation regressions |
| PowerShell `Parser.ParseInput` | 4,965 command bodies, zero parse errors | Syntax after reversing the generator's known quote escaping |
| Bash `--noprofile --norc -n` | 396 apply/revert artifacts, zero syntax failures | Shell syntax, including collection start/end code; no execution |
| Python `ast.parse` | 81 generated Python heredoc bodies, zero syntax errors | Syntax only; no imports or statements from those bodies executed |
| `vue-tsc --noEmit` | Passed | Project type checking |
| ESLint on the new regression test | Passed | Targeted lint conformance |
| Production web build | Passed | Updated catalogs can be bundled |

The generation surface was exercised through `loadApplicationComposite()` and its real compiled script objects.
An audit-only driver serialized their apply/revert text as inert JSON for parsing; that driver was removed.
The parser passes were one-off audit checks, not new CI tooling.
Persistent regression coverage is in
[`CatalogCommandGeneration.spec.ts`](../tests/integration/application/Application/Loader/Collections/CatalogCommandGeneration.spec.ts).

PowerShell checks covered extracted command bodies, not a complete `cmd.exe` grammar or every nested language.
Modern local parsers do not establish compatibility with older PowerShell, Bash, or Python versions.
They do not establish command availability, privilege requirements, policy enforcement, or successful reversal.

YAML language-server diagnostics were unavailable because the server is not installed and installation was previously declined.
TypeScript LSP diagnostics initially passed, but later freshness requests timed out; the final full type check passed.
At this audit stage, Vite reported large-bundle and out-of-root-output-directory warnings.
The output directory is inside the repository. The subsequent modernization
enabled clean output builds; the large-bundle warning remains.

## Outstanding release gates

- Revalidate every remaining policy, service, scheduled task, application identifier, and cleanup path
  against the exact OS edition/build and application versions claimed as supported.
- Verify Defender/Tamper Protection, SmartScreen, Windows Update, Appx/Store, and Recall enforcement
  on disposable Windows installations. Existing Recall guards do not verify cumulative-update revision or edition.
- Verify macOS launchctl/defaults applicability, SIP/TCC restrictions, current application locations,
  and non-default home-directory cases on disposable macOS systems.
- Verify Linux distribution/package-manager differences, custom XDG paths, permissions,
  and Snap/Flatpak layouts on disposable Linux systems.
- The macOS glob helper still expands patterns before `sudo`, excludes dotfiles by default,
  and treats glob metacharacters in expanded paths as patterns. These behaviors were not redesigned.
- Reverts generally restore configured defaults, not captured previous state.
  Deleted data is not recoverable through revert. Verify this separately for each operation.
- Hard-coded tracking-host ownership and every remaining Chrome/Firefox/Edge policy were not exhaustively revalidated.
- Test actual apply/revert behavior only in disposable VMs with snapshots, not on this computer.

See also the [maintenance assessment](maintenance-assessment.md) and
[non-executing development guidance](development.md#non-executing-validation-on-personal-computers).

## Primary references checked

[1]: https://learn.microsoft.com/en-us/windows-server/storage/file-server/troubleshoot/detect-enable-and-disable-smbv1-v2-v3 "Microsoft: Detect, enable, and disable SMB protocols"
[2]: https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/wevtutil "Microsoft: wevtutil syntax"
[3]: https://learn.microsoft.com/en-us/deployedge/microsoft-edge-policies/metricsreportingenabled "Microsoft: MetricsReportingEnabled is obsolete after Edge 88"
[4]: https://learn.microsoft.com/en-us/deployedge/microsoft-edge-policies/sendsiteinfotoimproveservices "Microsoft: SendSiteInfoToImproveServices is obsolete after Edge 88"
[5]: https://learn.microsoft.com/en-us/deployedge/microsoft-edge-policies/diagnosticdata "Microsoft: DiagnosticData policy"
[6]: https://learn.microsoft.com/en-us/deployedge/microsoft-edge-policies/urldiagnosticdataenabled "Microsoft: URL reporting applies only to optional diagnostics"
[7]: https://www.gnu.org/software/bash/manual/html_node/Word-Splitting.html "GNU Bash: empty IFS disables field splitting"
[8]: https://kb.parallels.com/en/114422 "Parallels: notification controls and limitations"
