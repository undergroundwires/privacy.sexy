# Maintenance assessment

Assessment date: 2026-09-13. Starting revision: `7b956f3d` (2025-04-18).

## Scope and safety

This is a bounded maintenance update, not certification of the entire script catalog.
The review covered dependency resolution, build/test compatibility, test execution boundaries,
and selected Windows changes with current Microsoft documentation.
No privacy script, registry command, service change, scheduled task, installer, updater,
or generated shell file was executed on the development computer.
Dependencies and npm cache were installed inside the repository with lifecycle scripts disabled.
The already-installed Node.js 26.5.0 runtime was used; no system toolchain was installed or changed.

## Dependency decisions

| Component | Previous declared version | Updated baseline |
| --- | --- | --- |
| Vite | 6.2.0 | 7.3.6 |
| Vue plugin / legacy plugin | 5.2.1 / 6.0.2 | 6.0.8 / 7.2.1 |
| Vitest | 3.0.7 | 5.0.0 |
| Electron | 34.3.0 | 44.3.0 |
| electron-vite | 3.0.0 | 5.0.0 |
| electron-builder | 25.1.8 | 26.15.3 |
| Vue | 3.5.13 | 3.5.42 |
| TypeScript / vue-tsc | 5.6.3 / 2.2.6 | 6.0.3 / 3.3.11 |
| ESLint / typescript-eslint | 8.57.0 / 6.21.0 | 10.10.0 / 8.70.0 |
| Cypress | 14.1.0 | 16.0.0 |
| markdown-it | 14.1.0 | 15.0.2 |
| PostCSS / Sass | 8.5.3 / 1.85.1 | 8.5.28 / 1.104.1 |

Other compatible dependencies were refreshed in `package-lock.json`.
Exact registry versions and peer requirements were checked during the assessment.

- Vite 8 is deferred because stable electron-vite 5 declares support for Vite 5 through 7.
  No beta bundler was introduced.
- Vitest and its V8 coverage provider now use 5.0.0, with jsdom 30.0.1.
- ESLint 10 uses `eslint-plugin-import-x` under the existing `import` namespace to preserve
  rule tables and inline directives. Its resolver uses `import-x/resolver`.
  The unsupported `disableScc` implementation option was removed; cycle checking remains enabled.
- markdown-it 15 supplies its own types. The renderer now imports its public instance and renderer-rule
  types from the package root rather than an unexported internal path; `@types/markdown-it` was removed.
- Floating UI Vue is 2.0.1, vite-plugin-minify is 3.0.0, and start-server-and-test is 3.0.12.
- TypeScript 7.0.2 remains deferred: current typescript-eslint 8.70.0 supports TypeScript below 6.1.
  Node type declarations remain on 22.x to avoid assuming APIs absent from the oldest supported runtime.
- Removed the ESLint-8-only Vue Airbnb adapters and migrated to native flat configuration.
  Legacy core, import, TypeScript, Vue/template, and stylistic enforcement is retained through
  supported plugins and declarative rule tables. Obsolete IDs have explicit replacements;
  unrelated React/JSX rules are not carried into this non-React codebase.
  New inline exceptions are limited to deliberate invalid-input fixtures and predetermined fake predicates.
- TypeScript 6 is supported without `ignoreDeprecations`, disabling strictness, or forcing peers.
  Removed deprecated `baseUrl` and `downlevelIteration`, made aliases relative, and explicitly
  enabled strict checking and Node types. The separate Cypress config now inherits the modern target.
  Shared method-key, callback, injection, and error-boundary types were corrected instead of suppressing errors.
- The YAML plugin's exact js-yaml 4.1.0 pin is overridden with compatible 4.3.2.
  The earlier minimatch override was removed with the obsolete TypeScript parser dependency.
- Electron compilation preserves main/preload `.mjs` filenames and the bundled `electron-log` workaround.
  Electron 44 raises the macOS baseline to Ventura; desktop requirements were corrected accordingly.
- CI and Docker use Node.js 24 rather than a moving Docker LTS tag. Local Node requirements are explicit.
  Development now requires Node 22.22.2+, 24.15.0+, or 26+ to satisfy jsdom 30's engine range.
- CodeQL actions were migrated from retired v2 to v4, using JavaScript/TypeScript no-build analysis.
- The read-only Python validator now has a uv project and lock, with jsonschema 4.26.0 and PyYAML 6.0.3.
  Its hash-pinned requirements export remains compatible with the existing CI installation step.
  An existing managed Python 3.12 interpreter was used; its environment and cache stayed in the repository.

The initial lockfile audit reported **67 findings: 3 critical, 45 high, 17 moderate, and 2 low**.
After dependency resolution and the scoped overrides, `npm audit --package-lock-only --ignore-scripts`
reported **zero findings**, including development dependencies.
Audit results are time-sensitive advisory matches, not proof of exploitability or absence of vulnerabilities.
The dependency-audit workflow now includes development dependencies and uses corrected PR path filters.

### Dependency upgrade follow-up validation

The follow-up upgraded the baseline above after the initial maintenance checks below:

- Regenerated the lockfile from the current manifest, with the old lockfile and installed tree
  retained in an external temporary backup. No unrelated source changes were reverted.
- A clean `npm ci --ignore-scripts --legacy-peer-deps=false --strict-peer-deps`
  with development, optional, and peer dependencies included passed without changing the lockfile.
  `npm ls --all` passed; npm audit reported zero findings.
- `npm run check:quality` passed: type checking, full ESLint, 254 safe test files / 2,359 tests,
  and the production web build. The separate Cypress TypeScript project also passed.
- The upgraded V8 coverage provider passed the safe suite. Electron main/preload/renderer compilation
  and the web/unbundled artifact checks passed without launching Electron.
- A direct ESLint API check accepted a valid TypeScript path alias and rejected a nonexistent import.
  New ESLint correctness rules are enabled; caught errors now retain their original causes.
- A managed browser loaded production artifacts through intercepted local-file responses, without a server.
  Recall apply/revert text generation, Markdown external-link safety attributes, empty search,
  macOS/Linux switching, and Floating UI tooltip positioning worked. No browser warnings or errors
  were reported, and the browser was closed afterward.
- At that stage, large-bundle and out-of-root output-directory warnings were still reported. The final modernization now cleans the configured output directory. The full integration suite,
  Cypress binary execution, desktop packaging/runtime, and system-changing scripts were not run.
  These checks still require the release environments described below.

## Windows corrections

### Recall

- Preserve the existing `Disable Recall` script identifier.
- Use `HKLM\SOFTWARE\Policies\Microsoft\Windows\WindowsAI\DisableAIDataAnalysis = 1`,
  replacing the historical `WindowsCopilot` path.
- State that saving snapshots is opt-in, and managed commercial devices have Recall disabled/removed by default.
- Document Pro, Enterprise, Education, and IoT Enterprise applicability from Windows 11 24H2
  with KB5055627, build 26100.3915, or later. Home enforcement is not assumed.
- Add a local build-number guard to both generated apply and revert code.
  The guard rejects pre-26100 builds; it does not verify edition or cumulative-update revision.
- Warn that the policy deletes saved snapshots. Reverting removes the policy value, not the deletion.
  Do not claim that this snapshot policy uninstalls Recall or disables standalone Click to Do.

The guard uses `RunPowerShellWithSetup` directly rather than modifying shared version/elevation helpers.
Generation tests caught two reasons not to broaden that change:

1. Adding another shared version case pushed unrelated privileged commands past the 8,191-character batch limit.
   That attempted shared change was removed; the limit was not relaxed.
2. The optional-elevation helper previously dropped `setupCodeUnelevated` and contained an invalid nested expression.
   That root defect is now fixed. Five generation regressions verify normal/elevated apply and revert paths,
   Intel/AMD mitigation guards, and the TLS server-side skip guard. No generated PowerShell was executed.

### Copilot and WMIC

- Preserve the four legacy Copilot script identifiers and revert operations, but remove their Strict recommendations.
- Explain that legacy policy, eligibility, startup, and taskbar keys do not control the current Microsoft Copilot app.
- Remove unsupported claims of guaranteed background-service disablement and universal prevention of data transmission.
- Link Microsoft's current app removal and AppLocker guidance rather than inventing a replacement registry key.
- Replace the two WMIC documentation examples with PowerShell/CIM guidance.
  WMIC was not present in executable catalog code in the inspected entries.

### Defender and update-policy corrections

- Corrected the extended-cloud-check action: it now writes zero extra seconds rather than 50.
  The normal ten-second cloud check remains; this setting is not an upload blocker.
- Corrected contradictory cloud-block levels so the preference and both registry writes use zero.
- Removed a duplicate apply-side Defender setter invocation. Revert behavior is documented as a configured
  default/removal operation, not restoration of a captured prior preference.
- Documented Tamper Protection limitations and removed guarantees that these settings stop all cloud uploads.
- Retained currently documented `NoAutoUpdate`/`AUOptions` controls. The two historical schedule-deletion
  script IDs remain stable, but their documentation now clearly says they do not disable Windows Update.

## Desktop and tooling correctness

- All created Electron web contents receive the navigation policy. New windows are denied; renderer navigation
  is cancelled before canonical HTTP(S) URLs are handed to the native opener. Other schemes and credentials are rejected.
  The implementation uses Electron 44's event-details URL, not deprecated positional event arguments.
- Failed release-page opening retains the manual updater's recovery path. Tests use fake openers and dialogs.
- Repaired method context binding. Tests now detach methods before invocation, proving `this` is retained for
  own methods, immediate-prototype methods, nested objects, and arrays, without rebinding ancestor methods.
- Preserved real Vue injection defaults and tested app-provided dependency resolution through Vue itself.
- Replaced a Node process-class dependency in a test fake with the runner's minimal exit/error event contract.
- The artifact verifier now reads configuration directly, without spawning a helper process, and requires exact
  entry filenames. A fixture containing only `index.html.map` was correctly rejected. Temporary fixtures were removed.

## Validation and release gates

`vitest.safe.config.ts` allows unit tests, application-layer integration tests, and one reviewed DOM listener lifecycle test.
Factory mocks prevent imports of real Electron, logging, updater, and progress-window packages.
Application child-process operations throw instead of returning a simulated success.
This matters because Electron 44 can download its binary at import time, even after `npm ci --ignore-scripts`.
This profile is not a security sandbox; new imports and filesystem adapters still require review.
The new CI workflow exercises it on hosted Windows and Linux runners; those remote jobs were not run locally.

Initial maintenance checks, before the dependency upgrade follow-up:

- TypeScript 6 type-checking with `vue-tsc --noEmit`, plus the separate Cypress TypeScript project.
- 254 safe test files, 2,359 tests passing, including compilation of all three collections and DOM listener teardown.
- Production-source coverage: 70.94% statements, 64.9% branches, 70.06% functions, and 71.63% lines.
- The Python schema validator passed all three collections, and its requirements export matches the uv lock.
- Full repository ESLint, changed-document Markdown lint, and collection/changed-CI YAML lint passed.
- TypeScript diagnostics were clean. Markdown has no configured language server; YAML and Dockerfile
  language servers were unavailable and were not installed. Docker image construction was not tested.
- Web production build and Electron main/preload/renderer compilation, without loading the desktop application.
- Real-browser use of local production artifacts through intercepted requests, with no local server:
  Recall selection, apply/revert generation, rendered policy warnings, empty search,
  Strict selection excluding the four legacy Copilot keys, and macOS/Linux switching.
  The TypeScript 6 build was also exercised for resize dragging, tree view, Escape-key modal dismissal,
  CPU-guard apply/revert generation, and the corrected Defender timeout value.
  The browser reported no warnings or errors and was closed after verification.
- Those initial builds reported warnings for large bundles and the web output directory outside Vite's presentation root.
  The output directory is inside the repository. Its cleanup behavior was corrected in the final modernization; the large-bundle warning remains.

Still required before release:

- Disposable Windows 11 24H2/25H2 machines, including supported policy editions and Home negative cases.
  Test apply/revert behavior, older-build skipping, cumulative updates, and policy refresh behavior.
- Eligible Copilot+ hardware for Recall behavior, including opt-in state and snapshot deletion.
- Desktop packaging, preload/IPC, download/update, and installation checks on each supported platform.
- Cypress/browser regression coverage beyond the focused manual checks.
- A wider catalog review, especially Defender, SmartScreen, Windows Update, Store/Appx removal,
  Edge, services, scheduled tasks, and hard-coded tracking hosts. Historical test tables are not current guarantees.
- A broader Electron security review of existing renderer privileges and exposed IPC capabilities.
  Protocol-restricted URL handling is implemented, but this is not a full sandbox or IPC authorization audit.

None of these release gates should be satisfied by applying scripts to a personal computer.
See [safe development commands](./development.md#non-executing-validation-on-personal-computers).

## Independent review and static analysis

A final read-only review found no introduced blocking correctness or safety defect.
The review checked changed source, configuration, lockfile compatibility, and supplied validation evidence.
It accepted the bounded maintenance scope, not desktop or Windows-policy release readiness.
The final safe test, type-check, and lint runs passed after the last bootstrap change.

Initial static commands ran sequentially after review and tests, before the quality-automation follow-up:

| Command | Outcome |
| --- | --- |
| `pmat analyze complexity` | Completed: 947 files, 9 error-level and 13 warning-level complexity findings. |
| `pmat analyze tdg` | Completed: 548 files, reported 97.9/100 (B), no critical defects. |
| `pmat analyze dead-code --path .` | Unsupported for the detected JavaScript language; not a passing dead-code check. |
| `pmat repo-score` | Completed: 45/100 (F); its recommendations include Makefile targets and PMAT-specific configuration. |
| `solidkg architecture health --path . --json` | Completed in read-only, no-daemon mode using the existing index. |

PMAT's scores are tool-specific heuristics, not release verdicts. Existing complexity hotspots were not refactored.
The Makefile recommendation does not negate the npm commands and GitHub workflows that this project already uses.
The subsequent quality-automation work measured 75/100 (B), up from 45/100; further PMAT work stopped at the user's request.
The reported 152.5-hour refactoring figure is not a measured effort estimate and is not used for planning.
Parallel source reviews found that the largest listed complexity hotspots were predominantly declarative test matrices,
while the inspected production throttling and template-parsing code was already decomposed and tested.
Splitting those fixtures solely to reduce a metric would not improve their behavioral coverage.

SolidKG reported 1,061 indexed files, 4 file-dependency cycles, no package-dependency cycles,
6,360 unresolved references, and 1,586 static-unreferenced candidates.
File/package relationship signals and unreferenced candidates have **partial** coverage.
Layer signals were **not run** because no layer rules were configured; manifest assignment coverage was complete.
The full JSON remains in the session's tool evidence. No snapshot comparison established whether findings were introduced.
These candidates are not proof of dead code or runtime defects, and were not used to justify unrelated changes.

## Primary references

- [Microsoft: Manage Recall](https://learn.microsoft.com/en-us/windows/client-management/manage-recall)
- [Microsoft: DisableAIDataAnalysis policy](https://learn.microsoft.com/en-us/windows/client-management/mdm/policy-csp-windowsai#disableaidataanalysis)
- [Microsoft: Current Copilot management](https://learn.microsoft.com/en-us/windows/client-management/manage-windows-copilot)
- [Microsoft: WMIC](https://learn.microsoft.com/en-us/windows/win32/wmisdk/wmic)
- [Electron 44.3.0 platform support](https://github.com/electron/electron/blob/v44.3.0/README.md#platform-support)
- [Electron 44.3.0 import-time downloader](https://github.com/electron/electron/blob/v44.3.0/npm/index.js)
- [electron-vite 5.0.0 changes](https://github.com/alex8088/electron-vite/blob/v5.0.0/CHANGELOG.md)
- [Vitest 4 migration](https://v4.vitest.dev/guide/migration)
- [npm ignore-scripts](https://docs.npmjs.com/cli/v11/using-npm/config/#ignore-scripts)
- [TypeScript 6 migration](https://devblogs.microsoft.com/typescript/announcing-typescript-6-0/)
- [Microsoft: Cloud block timeout](https://learn.microsoft.com/en-us/defender-endpoint/configure-cloud-block-timeout-period-microsoft-defender-antivirus)
- [Microsoft: Cloud protection configuration](https://learn.microsoft.com/en-us/defender-endpoint/cloud-protection-configure)
- [Microsoft: Windows Update policy settings](https://learn.microsoft.com/en-us/windows/deployment/update/waas-wu-settings)
