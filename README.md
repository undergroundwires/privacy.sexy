## [privacy.sexy](https://privacy.sexy) converted to pure PowerShell

* [``.github/workflows/tl.yaml``](https://github.com/couleurm/privacy.sexy-TL/blob/patch-1/.github/workflows/tl.yaml) triggers to run ci.ps1, uploads `privacy.sexy.ps1`
* [``ci.ps1 ``](https://github.com/couleurm/privacy.sexy-TL/blob/patch-1/ci.ps1) generates `privacy.sexy.ps1` from ``classPrivacySexy.ps1`` and what ``Convert-PrivacySexyToPSModule.ps1`` returns
* [``classPrivacySexy.ps1``](https://github.com/couleurm/privacy.sexy-TL/blob/patch-1/classPrivacySexy.ps1) has all the helper functions
* [``Convert-PrivacySexyToPSModule.ps1``](https://github.com/couleurm/privacy.sexy-TL/blob/patch-1/Convert-PrivacySexyToPSModule.ps1) contains the code that parses and converts the YAML tree
