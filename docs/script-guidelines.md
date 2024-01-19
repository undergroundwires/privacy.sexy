# privacy.sexy Script Guidelines

Create a script for privacy.sexy by submitting a PR or creating an issue (details in [Extend Scripts](./../CONTRIBUTING.md#extend-scripts)).
As scripts are central to privacy.sexy and reach a global audience, their design is critical.

Key attributes of a good script:

- ✅ Well-referenced [documentation](#documentation).
- ✅ Utilizes [shared functions](#shared-functions).
- ✅ Has a [simple name](#name).

## Name

- Choose a title that is easy to understand for all users, regardless of technical skill, yet remains technically accurate.
- Focus on privacy implications, avoiding complex or overly technical jargon.
- Maintain consistency in naming, avoiding linguistic variations.
- Use action-oriented language for clarity and directness. Use an instruction format like "do this, do that" for clear, direct guidance.
- Respect the official casing of brand names.
- Choose clear and uncomplicated language.
- It should start with an imperative noun.
- Start with action verbs like `Clear`, `Disable`, `Remove`, `Configure`, `Minimize`, `Maximize`. While exceptions exist, these prefixes help maintain naming consistency.
- Favor the terms:
  - `Disable` over `Turn off`, `Stop`, `Prevent`
  - `Configure` over `Set up`
  - `Clear` over `Erase`, `Clean`
  - `Minimize` over `Limit`, `Reduce`
  - `Maximize` over `Extend`, `Delay`, `Postpone`, `Prolong`
  - `Remove` over `Uninstall`
- Structure your phrases for clarity, examples:
  - Prefer `Disable XX telemetry` over `Disable telemetry in XX`
  - Prefer `Clear XX data` over `Clear data from XX`, or `Clear data of XX`.
- Use sentence case rather than Title Case.

## Documentation

- Use credible and reputable sources for references.
- Use archived links by using [archive.org](https://archive.org) or [archive.today](https://archive.today).
  - Format archive.today links fully, for example: `https://archive.today/YYYYMMDDhhmmss/https://privacy.sexy`.
- Explain the default behavior if the script is not executed.

## Shared functions

Use existing shared functions when possible, like `DisableService` for disabling services,.

- 📖 Learn about templates in [templating.md](./templating.md).
- 📖 For syntax, see [collection-files.md](collection-files.md).

## Code

- Prefer [shared functions](#shared-functions); avoid custom code unless necessary.
- Keep code simple and compatible with older systems.
- Focus on reliability, ensuring the script is error-resistant, works on different locales and handles unexpected situations.
- Language selection:
  - Windows: Use batch when simpler, otherwise PowerShell.
  - macOS/Linux: Use bash when simpler, otherwise Python.
- Provide revert code to restore original/default settings when applicable.
