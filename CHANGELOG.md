# Changelog

## 0.10.3 (2021-08-27)

* unrecommend VSS and document its breaking behavior | [7714898](https://github.com/undergroundwires/privacy.sexy/commit/77148980e08859f89c15c6604e55b56ce4f74358)
* fix incorrect modification of Desktop folder on ThisPC (#71) | [eb9ac35](https://github.com/undergroundwires/privacy.sexy/commit/eb9ac35a923325cc2c9983ef71c0d904337a58f5)
* add initial integration tests | [49600c5](https://github.com/undergroundwires/privacy.sexy/commit/49600c5f37ca33c1687885fdf02a71ef7d3e6e8c)
* unify usage of sleepAsync and add tests | [36f0805](https://github.com/undergroundwires/privacy.sexy/commit/36f08055909f371fd9cbe3480ea813b963aea22b)
* fix broken URLs and automate broken URL checks #70 | [db62ed7](https://github.com/undergroundwires/privacy.sexy/commit/db62ed7f3ac63e9f2d762eb946060595eb9f5626)
* fix hiding recent files in quick access | [b976b92](https://github.com/undergroundwires/privacy.sexy/commit/b976b920318dba55b32d39f148fdca4f6be3cce3)
* bump dependencies to latest #75, #69 | [0a857aa](https://github.com/undergroundwires/privacy.sexy/commit/0a857aa09ee703d34ad0422bd1731158017a9a58)
* Fix NTP configuration before running the service (#72) | [71e70e5](https://github.com/undergroundwires/privacy.sexy/commit/71e70e50c51249bb10f6203414948b325acc2b2a)
* Fix typo on main page (#82) | [487001a](https://github.com/undergroundwires/privacy.sexy/commit/487001af485fdbb958615d7b52c09c2e386ddaf2)
* Improve issue templates | [f2935e4](https://github.com/undergroundwires/privacy.sexy/commit/f2935e4008f1231ef174f8932290e11715564d20)
* Fix infinitely subscribing to state changes | [ea5f9ec](https://github.com/undergroundwires/privacy.sexy/commit/ea5f9ec27df7cec6ac575e23fef18948d2b8e68a)
* Fix select options being clickable when disabled | [1c6b305](https://github.com/undergroundwires/privacy.sexy/commit/1c6b3057ea6e45125cadf374f20a905712ccdf3c)
* Fix tests for `ParameterSubstitutionParser` | [2a08855](https://github.com/undergroundwires/privacy.sexy/commit/2a08855e5d1bdf74354fd692cbfebd1a48e495ac)
* Fix excessive highlighting on hover | [ec0c972](https://github.com/undergroundwires/privacy.sexy/commit/ec0c972d348ffd5897f115d201031b704875b56a)
* Fix dead URLs | [439cd30](https://github.com/undergroundwires/privacy.sexy/commit/439cd303ff3db96a53664e5f44fefe12b95c5e6c)

[compare](https://github.com/undergroundwires/privacy.sexy/compare/0.10.2...0.10.3)

## 0.10.2 (2021-04-19)

* in CI/CD, run other tests/check even if one of them fails | [5c43965](https://github.com/undergroundwires/privacy.sexy/commit/5c43965f0bc44f991ada7d3bad68937a80665dc3)
* fix desktop initial window size being bigger than current display size on smaller Linux/Windows screens | [02bdc4c](https://github.com/undergroundwires/privacy.sexy/commit/02bdc4cf0426c452f3fc9af52b819ca9b0757290)
* refactor extra code, duplicates, complexity | [00d8e55](https://github.com/undergroundwires/privacy.sexy/commit/00d8e551db001247fadfb6f6af7a4c5ce19a9e64)
* improve disabling ads and marketing #65 | [040ed27](https://github.com/undergroundwires/privacy.sexy/commit/040ed2701c4a468749901f4c5369b221bc0973c4)
* document breaking behavior in script name #64 | [b1ed3ce](https://github.com/undergroundwires/privacy.sexy/commit/b1ed3ce55f2d003cad1ead23e674aa66d4eb5802)
* add module alias '@tests/' | [60c8061](https://github.com/undergroundwires/privacy.sexy/commit/60c80611eab227791fabb883caf93418cef5fd00)
* document chromium warning for policy changes | [aea04e5](https://github.com/undergroundwires/privacy.sexy/commit/aea04e5f7cd48fbb9b407b68ade75575a6064c82)
* fix script revert activating recommendation level | [a2f1085](https://github.com/undergroundwires/privacy.sexy/commit/a2f10857e2a8debb3ce01f79b0dfbe8649ea9a17)
* fix typo and dead URL in Windows scripts (#70) | [8141a01](https://github.com/undergroundwires/privacy.sexy/commit/8141a01ef798331b4d82f5ca95f7b18df4f6f912)
* fix vue warning for undefined property during render | [b25b8cc](https://github.com/undergroundwires/privacy.sexy/commit/b25b8cc8052655af70b0695c6c3085974d783bb6)

[compare](https://github.com/undergroundwires/privacy.sexy/compare/0.10.1...0.10.2)

## 0.10.1 (2021-03-25)

* refactor script compilation to make it easy to add new expressions #41 #53 | [646db90](https://github.com/undergroundwires/privacy.sexy/commit/646db9058541cebd0af437554de04fdc6bb63a6e)
* restructure presentation layer | [f3c7413](https://github.com/undergroundwires/privacy.sexy/commit/f3c7413f529be4a00dba7b0ab23904b48ea13a35)
* fix a test where "it" is not used inside "describe" | [1a5f920](https://github.com/undergroundwires/privacy.sexy/commit/1a5f92021f7423cd039f8f5326cd6f99b355c962)
* bump dependencies to latest | [1f515e7](https://github.com/undergroundwires/privacy.sexy/commit/1f515e7be525291c960ccb71db05312db6da53f5)
* fix throttle function not being able to run with argument(s) | [1935db1](https://github.com/undergroundwires/privacy.sexy/commit/1935db10192051401ab00ca2cd767955d0d3b866)
* fix fs module hanging not allowing code to run | [5f527a0](https://github.com/undergroundwires/privacy.sexy/commit/5f527a00cf225d3e74b3f6577d6e2456e919de24)
* refactor all modals to use same dialog component | [6f46cdb](https://github.com/undergroundwires/privacy.sexy/commit/6f46cdb4ed49a8941c6c0dde5c5e2a816c06daef)
* fix safari cleanup scripts that are not working on modern versions | [05932c5](https://github.com/undergroundwires/privacy.sexy/commit/05932c5a36446d551c5bc811165e3295fbe15e3f)
* refactor features to use shared functions #41 | [ac2249f](https://github.com/undergroundwires/privacy.sexy/commit/ac2249f25664827d8a6d2c7ebd659ccf126b0cde)
* increase performance by polyfilling ResizeObserver only if required | [448e378](https://github.com/undergroundwires/privacy.sexy/commit/448e378dc4501f9de69af63634c87d0e5060bf52)

[compare](https://github.com/undergroundwires/privacy.sexy/compare/0.10.0...0.10.1)

## 0.10.0 (2021-03-02)

* allow functions to call other functions #53 | [7661575](https://github.com/undergroundwires/privacy.sexy/commit/7661575573c6d3e8f4bc28bfa7a124a764c72ef9)
* add option to run script directly in desktop app | [9a6b903](https://github.com/undergroundwires/privacy.sexy/commit/9a6b903b9297802845043fd41115756acd4a145c)
* add script to automatically kill devicecensus process | [c9b91f6](https://github.com/undergroundwires/privacy.sexy/commit/c9b91f6d8f9bd16308b6beda119e7154a985b6cf)
* refactor disabling application experience and document better | [45a3669](https://github.com/undergroundwires/privacy.sexy/commit/45a3669443d82855a52f60524d341c15f380f9e7)
* escape printed characters to prevent command injection #45 | [1260eea](https://github.com/undergroundwires/privacy.sexy/commit/1260eea690e4fa5420e58c9de9f88cc29cb242db)
* move code area to right on bigger screens | [cf39e6d](https://github.com/undergroundwires/privacy.sexy/commit/cf39e6d2541ea547f41d9553c380c54c24c58038)
* more scripts to disable speech recognition and Cortana | [ee43fd9](https://github.com/undergroundwires/privacy.sexy/commit/ee43fd92a019ebd26c13890f9146c5b5bb56afaf)
* add more macos scripts for privacy cleanup | [b0a7d0b](https://github.com/undergroundwires/privacy.sexy/commit/b0a7d0b53b3d8ac144a0241d70c037f460b0c0cc)
* add better error messages to setting vscode settings | [65226f3](https://github.com/undergroundwires/privacy.sexy/commit/65226f3984480d0bc7932fd8d76a328f08308850)
* remove windows scripts for removing non-bloating system apps #55 | [15004ff](https://github.com/undergroundwires/privacy.sexy/commit/15004ff1f1fb85a1d92e11ef695bcb2f37110610)
* remove "preview" disclaimer from macOS | [970221b](https://github.com/undergroundwires/privacy.sexy/commit/970221b996e25fe5b029cbaa78607c9bbc8c3c0e)
* update screenshot | [bd41af4](https://github.com/undergroundwires/privacy.sexy/commit/bd41af466fd135f7dc2f171633e4f60d8547c373)

[compare](https://github.com/undergroundwires/privacy.sexy/compare/0.9.2...0.10.0)

## 0.9.2 (2021-02-13)

* do not compile with unused locals vuejs/vetur#1063 | [73e0520](https://github.com/undergroundwires/privacy.sexy/commit/73e0520de70cdbaf0ecdc6e9be5e85f003fcfb79)
* fix wrong path for NvTelemtry file in NVIDIA script | [34b8822](https://github.com/undergroundwires/privacy.sexy/commit/34b8822ac821acb47e483e21b57e380551bcf455)
* refactor event handling to consume base class for lifecycling | [f1e21ba](https://github.com/undergroundwires/privacy.sexy/commit/f1e21babbfaac21903594a37e30163bfe3338279)
* make compiler throw if a function call includes an unexpected parameter | [15353d0](https://github.com/undergroundwires/privacy.sexy/commit/15353d0e2513c89ee4ffd9d9c5e9e83ef69b96b6)
* refactor vscode configuration scripts using functions #41 | [67b2d1c](https://github.com/undergroundwires/privacy.sexy/commit/67b2d1c11cd5b131dff93a4437db79d96ed8b3dc)
* refactor state handling to make application available independent of the state | [df273f7](https://github.com/undergroundwires/privacy.sexy/commit/df273f7f635ab156ac51a8dfb3fec66c4979f1c4)
* add test to ensure correct shared functions are being parsed | [d7de420](https://github.com/undergroundwires/privacy.sexy/commit/d7de420d5c91bd9ce64880cd4a4391ad3a0a5401)
* refactor and add tests for NonCollapsingDirective | [5934b17](https://github.com/undergroundwires/privacy.sexy/commit/5934b1728328c3b2ece1597b74dd87477d162175)
* add GitHub issue templates | [daa997b](https://github.com/undergroundwires/privacy.sexy/commit/daa997b21b624d133c6f5e4cd6b70214588f9144)
* correct the typo in application.md (#60) | [575636e](https://github.com/undergroundwires/privacy.sexy/commit/575636e6b728a2bdd1a9bd72c57bbf2752f10887)

[compare](https://github.com/undergroundwires/privacy.sexy/compare/0.9.1...0.9.2)

## 0.9.1 (2021-01-23)

* in CI/CD, allow publishing to github if release is more than 2 hours old electron-userland/electron-builder#2074 | [cf907d0](https://github.com/undergroundwires/privacy.sexy/commit/cf907d029a6d80682ba78ec887a9c4fab639db51)
* in CI/CD, publish packages for other OSes if single one fails | [4015e2c](https://github.com/undergroundwires/privacy.sexy/commit/4015e2ccd8492e0693365b70fbfe3bd0ac7a6ea2)
* specify desktop publish targets as defaults (may) change | [2316e3f](https://github.com/undergroundwires/privacy.sexy/commit/2316e3fb6867e5d765eafcf675b77f88bd2a0f52)
* fix selection state indicator on cards not showing up | [8b0e47d](https://github.com/undergroundwires/privacy.sexy/commit/8b0e47da38c49cfe2645d7d25970c448ecd200f8)
* transpile using babel for legacy browser support | [7930bef](https://github.com/undergroundwires/privacy.sexy/commit/7930bef48c4e9a4fe0823673958ed8377f5ee533)
* fix node APIs no longer working on desktop nklayman/vue-cli-plugin-electron-builder#610, nklayman/vue-cli-plugin-electron-builder#742 | [d7f9ef1](https://github.com/undergroundwires/privacy.sexy/commit/d7f9ef1cbebe911aa19f29be8c5fa9360550793e)
* improve explanation for selections | [229c13a](https://github.com/undergroundwires/privacy.sexy/commit/229c13a195dee92e4a31731b7b41c319273a16f1)

[compare](https://github.com/undergroundwires/privacy.sexy/compare/0.9.0...0.9.1)

## 0.9.0 (2021-01-15)

* refactor application.yaml to become an os definition #40 | [f7557bc](https://github.com/undergroundwires/privacy.sexy/commit/f7557bcc0faf44e8395b68c7eb14c5f715f07b92)
* refactor folders to move "/state" (IApplicationState) inside "/context" (IApplicationContext) | [3467241](https://github.com/undergroundwires/privacy.sexy/commit/34672414c3e0757173036e351df0a73c1708ded5)
* add scripts to prevent family safety monitoring | [e14bf2b](https://github.com/undergroundwires/privacy.sexy/commit/e14bf2bfa03efe28ff39942c9891fca605f13eed)
* rework Cortana scripts to remove duplicates, better document and support Windows version 2004/2009 #43 | [7cc161c](https://github.com/undergroundwires/privacy.sexy/commit/7cc161c828a3fa49f6f254e31834a95a502b7aa2)
* rename Application to CategoryCollection #40 | [6fe858d](https://github.com/undergroundwires/privacy.sexy/commit/6fe858d86aeb0f8b6d5ae5c2a5e3c25ff32e5f6f)
* add script to clean previous windows installation #35 | [3455a2c](https://github.com/undergroundwires/privacy.sexy/commit/3455a2ca6ce13f9b0e866d88532a5c3d6de30d4d)
* refactor to allow switching ICategoryCollection context #40 | [2e40605](https://github.com/undergroundwires/privacy.sexy/commit/2e40605d59eb764768457c6af561487e7ff09777)
* fix typo causing uninstalling capabilities to fail #51 | [c299e95](https://github.com/undergroundwires/privacy.sexy/commit/c299e95bc6d588317b69a9efcf5752ff5c9c3926)
* improve uninstalling apps to show errors and exit if taking ownership fails #51 | [72e925f](https://github.com/undergroundwires/privacy.sexy/commit/72e925fb6f908cd58fb50618f29726b3fb54a7f1)
* move application.yaml to collections/windows.yaml #40 | [6b83dcb](https://github.com/undergroundwires/privacy.sexy/commit/6b83dcbf8fa08b4efe9974c7d7a667458f7c595c)
* recommend onedrive removal on strict mode | [663d63b](https://github.com/undergroundwires/privacy.sexy/commit/663d63bde08dd1b0d43ec144c758399cec90ec70)
* document app connector removal and recommend on strict mode | [9d009c4](https://github.com/undergroundwires/privacy.sexy/commit/9d009c40dd411c73c7ae032a78ec51490ecce024)
* recommend removing cortana taskbar icon on standard mode | [7ec889e](https://github.com/undergroundwires/privacy.sexy/commit/7ec889e759df04bba99d3b6c4d0597809bd94058)
* fix unintended null file creation #52 | [2428de2](https://github.com/undergroundwires/privacy.sexy/commit/2428de23ee02de987e7e6ec80ebd67be369d9048)
* add initial macOS support #40 | [8a8b731](https://github.com/undergroundwires/privacy.sexy/commit/8a8b7319d539b31c1d8ad9eaf541762d64f02493)
* add scripts to manage chromium based edge | [86a2b2f](https://github.com/undergroundwires/privacy.sexy/commit/86a2b2fda0b6a2565c550758c7c175fa795926b7)
* update screenshot | [c318bd3](https://github.com/undergroundwires/privacy.sexy/commit/c318bd301a2cbebbf5cdba06c0f18ac291aa4788)

[compare](https://github.com/undergroundwires/privacy.sexy/compare/0.8.2...0.9.0)

## 0.8.2 (2020-12-26)

* replace ampersand in "Movies & TV app" with "and" to prevent batch file from misinterpreting it (#45) | [52d4313](https://github.com/undergroundwires/privacy.sexy/commit/52d4313156d2dcbc508b7271e7d9dfd45723d7bc)
* update dependencies to latest #46 | [d9e44e2](https://github.com/undergroundwires/privacy.sexy/commit/d9e44e25744e5d0aa01b8fc0f0af74c48027aea3)
* fix type assignment error after typescript upgrade | [55f936f](https://github.com/undergroundwires/privacy.sexy/commit/55f936fee9f86757f63fa8952d89711feb247e5b)
* correct typos (#48) | [a744415](https://github.com/undergroundwires/privacy.sexy/commit/a744415eb2ab65ee4f519f863fdd6a43953377bb)
* in ci/cd, do not run security checks if PRs do not change dependencies #48 | [54ba4db](https://github.com/undergroundwires/privacy.sexy/commit/54ba4dbb0bf8f08f9479f8facb2e12c786c1bc51)
* rename app launch tracking tweak to make it more clear #44 | [b3117c2](https://github.com/undergroundwires/privacy.sexy/commit/b3117c27f283c2d5a25fd94021a9f628a272cda6)
* refactor capabilities to use a shared function #41 #47 | [c4ec6a1](https://github.com/undergroundwires/privacy.sexy/commit/c4ec6a1445d2fd5eb923c97b54aee01e272e13a8)
* rename "disable" to "uninstall" for removing capabilities #47 | [8cd3352](https://github.com/undergroundwires/privacy.sexy/commit/8cd3352017f9dc85f8efcd7b450d90f555d3e92e)

[compare](https://github.com/undergroundwires/privacy.sexy/compare/0.8.1...0.8.2)

## 0.8.1 (2020-11-16)

* refactor removing bloatware to use functions #41 | [ffa279f](https://github.com/undergroundwires/privacy.sexy/commit/ffa279f3dfe51db564f0a3859543eb212170e173)
* fix reinstalling store apps by searching appx for all users | [2c5ab3e](https://github.com/undergroundwires/privacy.sexy/commit/2c5ab3ea7da159cfb9fbfbbb7cdd28afbee965ea)
* fix clearing jump lists causing os to break and user pin removal #37 | [92c3dd9](https://github.com/undergroundwires/privacy.sexy/commit/92c3dd923257ac940eab6cbab858698ed55a09b7)
* fix reinstalling store apps by searching appx for all users | [4e72673](https://github.com/undergroundwires/privacy.sexy/commit/4e7267337301fe4a0480ba0603218fca25c2d096)
* refactor unused imports | [45b8dd9](https://github.com/undergroundwires/privacy.sexy/commit/45b8dd972b1edf9e263858c23b27e7a1d2e07077)
* fix not being able to uninstall system apps | [31e08d2](https://github.com/undergroundwires/privacy.sexy/commit/31e08d231d52e2a691400468b7c599c142a29448)
* fix wrong app names caused by wrong Microsoft docs | [e41e40c](https://github.com/undergroundwires/privacy.sexy/commit/e41e40c5bf01e2971d3054fcd3a48f8465a96622)
* unrecommend some system apps and document more | [29c7704](https://github.com/undergroundwires/privacy.sexy/commit/29c7704e0bd38f6e9923cde84accb569b02d2dd6)
* fix not being able to rename paths including brackets | [ad1872e](https://github.com/undergroundwires/privacy.sexy/commit/ad1872e7cd4ad7ef9facf33fadfa8c6a55065dd3)
* fix errors when file already exists | [c26bc20](https://github.com/undergroundwires/privacy.sexy/commit/c26bc209eb167aa71cad10b7f3ea02d0dedd97b0)
* move Microsoft.Appconnector to right category | [b247b12](https://github.com/undergroundwires/privacy.sexy/commit/b247b12c3f009aab4350e33f4779fd193e570050)
* replace deprecated github ::set-env command | [ab7d617](https://github.com/undergroundwires/privacy.sexy/commit/ab7d617886a65fe4f3c2daa929168e5678ccae60)

[compare](https://github.com/undergroundwires/privacy.sexy/compare/0.8.0...0.8.1)

## 0.8.0 (2020-11-01)

* add support for different recommendation levels: strict and standard | [14be301](https://github.com/undergroundwires/privacy.sexy/commit/14be3017c55ed5e0d9bdecb63fcc4e1131e79ab0)
* Add GroupMe and Spotify removal option (#34) | [3785c62](https://github.com/undergroundwires/privacy.sexy/commit/3785c623f837b182d82fa383dfe7709722a67248)
* switch places of download and copy buttons | [50fb290](https://github.com/undergroundwires/privacy.sexy/commit/50fb29038ae19b17ec006093db02cf1e568d53c3)
* change "download" button to "save" on desktop | [07fc555](https://github.com/undergroundwires/privacy.sexy/commit/07fc555324d8bf4fa3594a9701daaa124a873153)
* show icons on cards during indeterminate and fully selected states | [1072505](https://github.com/undergroundwires/privacy.sexy/commit/1072505219edc47d82a91f148d1f310f32869fea)
* add scripts to increase cryptography, enable camera notifications and remove todo app (#36) | [4c68408](https://github.com/undergroundwires/privacy.sexy/commit/4c68408f1ec339dc8d39c7ab044f825a7f7185cb)
* update recommendations to be safer and consistent | [d0019c2](https://github.com/undergroundwires/privacy.sexy/commit/d0019c2c9b1eea620e2e8e02b586903ce62b80e3)
* rework disabling metadata retrieval | [ac70b06](https://github.com/undergroundwires/privacy.sexy/commit/ac70b063b8a15bc528256185792939685be6b36f)
* add all dist folders in gitignore because of files auto-generated by vscode | [1a9db31](https://github.com/undergroundwires/privacy.sexy/commit/1a9db31c7778c3269a71c0bd9665827efda70a02)
* add support for shared functions #41 | [8ce06fa](https://github.com/undergroundwires/privacy.sexy/commit/8ce06facbd54184402a4b1af3c7303e64db85b8a)
* hide scrollbars on code area when not overflowing | [fd28eaa](https://github.com/undergroundwires/privacy.sexy/commit/fd28eaad061c75ea1aa7e0f0d60ea37a7e52f8c4)
* update screenshot | [cfedcd7](https://github.com/undergroundwires/privacy.sexy/commit/cfedcd724cad7708b30c7390a7bca3b6313b6726)

[compare](https://github.com/undergroundwires/privacy.sexy/compare/0.7.6...0.8.0)

## 0.7.6 (2020-10-18)

* add docs for default0 pointing to github discussion (#30) | [a3fc378](https://github.com/undergroundwires/privacy.sexy/commit/a3fc3782efd346b4c99d2a0b40df2eb0229f5b36)
* add robots.txt to explicitly allow indexing | [4c2f749](https://github.com/undergroundwires/privacy.sexy/commit/4c2f74949b0758d33049bdfa4f0124a28958f8ea)
* add more reversibility | [19a092d](https://github.com/undergroundwires/privacy.sexy/commit/19a092dd31fb3588277f1ab3120b409d98506752)
* refactor to read more from package.json | [784a67a](https://github.com/undergroundwires/privacy.sexy/commit/784a67afff681bc19147d03c947de0e165d97e87)
* simplify "why" section | [77c3d2b](https://github.com/undergroundwires/privacy.sexy/commit/77c3d2bbb8d13db86bb82ed0b5cbeaacfdea3db9)
* update dependencies to latest | [11e0613](https://github.com/undergroundwires/privacy.sexy/commit/11e06131655398db08faeeacff62062e46e0dddd)
* run tests on all operating systems: macos, ubuntu, windows | [d9d7f62](https://github.com/undergroundwires/privacy.sexy/commit/d9d7f62d81d4d8f95104d33211e82641884d711f)

[compare](https://github.com/undergroundwires/privacy.sexy/compare/0.7.5...0.7.6)

## 0.7.5 (2020-09-14)

* fix reverting (reinstalling) capabilities not working | [939d838](https://github.com/undergroundwires/privacy.sexy/commit/939d838e3535bb1c9b00c8ea9dacb735ae41d700)
* fix tests and checks are not running on PRs | [82d5091](https://github.com/undergroundwires/privacy.sexy/commit/82d509129b4e4a5df4b84786a0d6842a7d26e888)
* fix the recycling bin option (#32) | [15db311](https://github.com/undergroundwires/privacy.sexy/commit/15db3118012a172a2191a2afad57084a65b34642)
* fix rendering issue in older edge/IE | [6efed72](https://github.com/undergroundwires/privacy.sexy/commit/6efed72bf25c2ddf0901caab7f22966ca13cd47a)
* fix pasting in search bar after page load showing no results | [d169434](https://github.com/undergroundwires/privacy.sexy/commit/d1694341578288eeaf8b80caf9296a38d76789f0)
* fix typo | [7dd15ed](https://github.com/undergroundwires/privacy.sexy/commit/7dd15ed06433e0e6583ab0fa46a683ce6554bbea)

[compare](https://github.com/undergroundwires/privacy.sexy/compare/0.7.4...0.7.5)

## 0.7.4 (2020-09-12)

* fix checked checkbox has blue border | [4ae385b](https://github.com/undergroundwires/privacy.sexy/commit/4ae385b7fcea9014a68442714b7d99e2ee7df7d0)
* fix spectre protection getting single lined #31 | [22b23a9](https://github.com/undergroundwires/privacy.sexy/commit/22b23a9ece446c7f9abd4ede293051eb616ad50a)
* fix missing reg value in denying app access to account | [3c13a9e](https://github.com/undergroundwires/privacy.sexy/commit/3c13a9e837e06e097450b31d7eb0c0e6bf20cefb)
* fix wrong path in clear all firefox user profile settings | [ee66196](https://github.com/undergroundwires/privacy.sexy/commit/ee66196d9a60f27d17ae7f62d02b4f119a47e6e0)

[compare](https://github.com/undergroundwires/privacy.sexy/compare/0.7.3...0.7.4)

## 0.7.3 (2020-09-12)

* fix vscode settings file override and add more configs | [a0d6172](https://github.com/undergroundwires/privacy.sexy/commit/a0d61728ead04b4455437f85820121a848db9e00)
* fix nvidia tweak error message, categorize and add reversibility | [99a2035](https://github.com/undergroundwires/privacy.sexy/commit/99a2035fdb0766a4dfc2753133eab0d7666516cd)
* improve CPU specific tweaks by conditional platform checks and reversibility | [8df5faf](https://github.com/undergroundwires/privacy.sexy/commit/8df5faf4ef05a49da63973bd0fbb5c5d07d5bd93)
* fix wrong path to the main telemetry file | [de4ac97](https://github.com/undergroundwires/privacy.sexy/commit/de4ac978bdda79573b36d355697b8a028d2c0beb)
* fix naming of firefox cleanup to mention profiles | [3ab48b1](https://github.com/undergroundwires/privacy.sexy/commit/3ab48b1cf5f7f934f07e468ef2318ccee07f530c)
* add reversibility and more scripts to denying app access with better structure | [1d465ee](https://github.com/undergroundwires/privacy.sexy/commit/1d465ee3189d0e5a827453b3f0eb4361efe23770)
* fix comment lines are being detected as duplicate in validation | [b6ccb59](https://github.com/undergroundwires/privacy.sexy/commit/b6ccb5927a20412976a54fd2215eb645092f98a8)
* add more detailed error message | [1f11c39](https://github.com/undergroundwires/privacy.sexy/commit/1f11c39773c12eccfb3efb898b58c2f6f37ab9ca)
* fix typo in a test | [1f19b25](https://github.com/undergroundwires/privacy.sexy/commit/1f19b2528a69383e63e579d2885f01cd804abf6c)

[compare](https://github.com/undergroundwires/privacy.sexy/compare/0.7.2...0.7.3)

## 0.7.2 (2020-09-06)

* update onesync documentation and do not recommend it as it breaks other apps | [f36d8bf](https://github.com/undergroundwires/privacy.sexy/commit/f36d8bfc7848bb65ac0c641e318a689bf3816ccf)
* add reversibility for biometric disabling and do not recommend it | [db74531](https://github.com/undergroundwires/privacy.sexy/commit/db74531cd4139615c6d595959217d3651f099019)
* fix bad highlighting of selected nodes when using keyboard navigation | [255133a](https://github.com/undergroundwires/privacy.sexy/commit/255133af4dfae40171406648a3e2920f16d71cb3)
* add reversibility to removing bloatware | [c7b2a70](https://github.com/undergroundwires/privacy.sexy/commit/c7b2a703128470a05f12c9c6e8002444def37ef8)
* fix indeterminate state being lost | [1f266c3](https://github.com/undergroundwires/privacy.sexy/commit/1f266c33535f72b69c65985bf2eff27cd2c5a104)
* fix wording in default text in text area | [ca63a09](https://github.com/undergroundwires/privacy.sexy/commit/ca63a0979ef55d07d09d9443e5cea9aa888870a5)
* add best practice suggestion to come back | [f4885b6](https://github.com/undergroundwires/privacy.sexy/commit/f4885b6f1c82752f2143934e336d6d1b1af03015)

[compare](https://github.com/undergroundwires/privacy.sexy/compare/0.7.1...0.7.2)

## 0.7.1 (2020-09-04)

* fix some browsers (including firefox) downloading the script as a text file | [8c17929](https://github.com/undergroundwires/privacy.sexy/commit/8c17929151f9c4fa5f48564492bbf400ced95eea)
* rename screenshot image file | [b8682a8](https://github.com/undergroundwires/privacy.sexy/commit/b8682a852a14ed6cf49986695d9510b840ac9d3d)
* fix new/changed script higlighting not working on production builds | [8c38dd7](https://github.com/undergroundwires/privacy.sexy/commit/8c38dd73d8c7b77d8d341c0389f4d7229f9b97fd)
* refactor unused imports | [6badfef](https://github.com/undergroundwires/privacy.sexy/commit/6badfef9daace0c5de3fd33652a82bfe22261b11)

[compare](https://github.com/undergroundwires/privacy.sexy/compare/0.7.0...0.7.1)

## 0.7.0 (2020-09-02)

* [search] better (multilined) message when there are no results | [ec15af0](https://github.com/undergroundwires/privacy.sexy/commit/ec15af01dd020b364c2174fe562fd66227c2320c)
* [search] added clear/close button | [d6fa9a2](https://github.com/undergroundwires/privacy.sexy/commit/d6fa9a2a03c0ebe68b94f0b80cc52b4e200c9213)
* move script generation to /generation | [5df4587](https://github.com/undergroundwires/privacy.sexy/commit/5df458739d076719e350ba194c4f3f772884fcdb)
* add auto-highlighting of selected/updated code | [b789250](https://github.com/undergroundwires/privacy.sexy/commit/b789250cb89e2130b08e1a927df8181cf945dfeb)
* prompt admin priviliges automatically | [f8ba5c4](https://github.com/undergroundwires/privacy.sexy/commit/f8ba5c46e4923d9c35f200f8a08aa6437f7c0ecc)
* add removal of ghost (default0) telemetry user | [c262681](https://github.com/undergroundwires/privacy.sexy/commit/c262681011f39b4412669b6cf233476f676ca550)
* add more windows defender tweaks, categorization and reversibility | [1a34c73](https://github.com/undergroundwires/privacy.sexy/commit/1a34c7374ba56bafa0209bbb55c81b233bb419ed)
* fix NTP script documentation is on wrong place | [3060ebf](https://github.com/undergroundwires/privacy.sexy/commit/3060ebf79cf242370433495cc3e1878b7581b202)
* updated dependencies to latest and audit fixes (#25) | [c628aa9](https://github.com/undergroundwires/privacy.sexy/commit/c628aa9aef8ab7c815661d3c1711e7fbc65c69a2)
* categorize, fix and extend windows log files cleanup | [594a14d](https://github.com/undergroundwires/privacy.sexy/commit/594a14d6ca76cbd27a21877b8c373c1930589ca6)
* add more OneDrive cleanup scripts and categorize them | [978d7d0](https://github.com/undergroundwires/privacy.sexy/commit/978d7d08638dd161082f239ed088b12302f29458)
* add disabling firefox telemetry | [f8b8b4c](https://github.com/undergroundwires/privacy.sexy/commit/f8b8b4c97ab734d5ba7370894b694993924388da)
* add disabling ccleaner telemetry | [018b7e2](https://github.com/undergroundwires/privacy.sexy/commit/018b7e270f207aac926cb12f8069ebfcdce193ce)
* Add disabling of PowerShell 7+ telemetry (#29) | [456e40b](https://github.com/undergroundwires/privacy.sexy/commit/456e40bedf9afcc846f9b13f1ea144cef6115cf6)
* categorize, fix, make scripts reversible in "UI for privacy", "security improvements" and "configure browsers" | [532915b](https://github.com/undergroundwires/privacy.sexy/commit/532915b95da9fecd6b981d91bf489359e4e53caa)
* fix "Configure Defender" being in wrong category #28 | [f709d6a](https://github.com/undergroundwires/privacy.sexy/commit/f709d6a566ed7846b677b383863deda9680a2a9c)
* do not hardcode capability versions and make them reversible | [2afef4e](https://github.com/undergroundwires/privacy.sexy/commit/2afef4ea3d0d3d09aa1fa1eedba8493680bd8f10)
* exclude paint, wordpad and notepad from bloatware removal | [d235dee](https://github.com/undergroundwires/privacy.sexy/commit/d235dee95514a01745aef9479d07f88ffb4b40b8)
* add reversibility on category level | [f51e885](https://github.com/undergroundwires/privacy.sexy/commit/f51e8859eeb32c944126d692cfe03a0320c8b568)
* refactor unused imports & variables | [a23d28f](https://github.com/undergroundwires/privacy.sexy/commit/a23d28f2cfa2d64d45460697cf5ee9d6b5920752)
* fix search (got broken in b789250) with tests and refactorings | [8bbe6eb](https://github.com/undergroundwires/privacy.sexy/commit/8bbe6ebf750f1a1cbab493fb99b5ea91f4e21609)
* update the screenshot to show off highlighting | [b4aacea](https://github.com/undergroundwires/privacy.sexy/commit/b4aacea2a3e0bbcf2d8a79ff67f51c0f19e888a6)

[compare](https://github.com/undergroundwires/privacy.sexy/compare/0.6.2...0.7.0)

## 0.6.2 (2020-08-16)

* 🐛 fixed disabling error reporting for november 2019 update | [5967347](https://github.com/undergroundwires/privacy.sexy/commit/5967347b80976a519f6f4eb1972a62f3e600df2b)
* 🐛 fixed blank screen and icons on mac | [7fac0fe](https://github.com/undergroundwires/privacy.sexy/commit/7fac0fe79f252e8f9dda4f6f83cd6fa4ba2b539f)
* 🐛 fixed removing onedrive does not delete scheduled tasks | [b6bfc25](https://github.com/undergroundwires/privacy.sexy/commit/b6bfc2572740c0cd46d3bc0058fa767dd5fa862e)
* ⚙️ enhanced tweak to disable for office telemetry | [afc3bfb](https://github.com/undergroundwires/privacy.sexy/commit/afc3bfb3b8896f332c9a196973ded3dce8fd21e4)
* ✨ added script to clear dotnet telemery | [1663bfe](https://github.com/undergroundwires/privacy.sexy/commit/1663bfeac7b6580b1335ca5fcf3587b69c080c72)
* 🐛 fixed changing time server not working | [c69998c](https://github.com/undergroundwires/privacy.sexy/commit/c69998c7cb29ffcf40f0af03b73150736581da69)
* 🔥 removed disabling ClickToRun as it breaks office | [3d3380f](https://github.com/undergroundwires/privacy.sexy/commit/3d3380f27ebeea53f17f49974aaa89300ffaf2dd)

[compare](https://github.com/undergroundwires/privacy.sexy/compare/0.6.1...0.6.2)

## 0.6.1 (2020-08-09)

* updated documentation | [5963d2b](https://github.com/undergroundwires/privacy.sexy/commit/5963d2bac551083f9d16cce6b851abf0e8b88ce7)
* fixed typo in footer | [5c15a7a](https://github.com/undergroundwires/privacy.sexy/commit/5c15a7a64aaf24578a32713dec491bf494216303)
* more scripts can be reverted | [831c014](https://github.com/undergroundwires/privacy.sexy/commit/831c014f977515454ee6dc664d77a8c434495501)
* moved windows connect now to security & recommended | [6049a2b](https://github.com/undergroundwires/privacy.sexy/commit/6049a2b834d8d17af741f8d8f8b07cd15153b001)
* fixed mac / linux download links | [4c8be45](https://github.com/undergroundwires/privacy.sexy/commit/4c8be45e287b5ea009d6f828f7f327f37850569e)
* tweaks to disable webcam, speech and compatibility telemetry | [a5dbe66](https://github.com/undergroundwires/privacy.sexy/commit/a5dbe66fc175e39397f296ab2ff703e9b0ab4d7c)
* refactorings | [66d4d39](https://github.com/undergroundwires/privacy.sexy/commit/66d4d39d5bf3db305450514c6b6224654dafbfb2)
* fixed removing onedrive does not clean start menu / quick access | [1cc1219](https://github.com/undergroundwires/privacy.sexy/commit/1cc12195a3e9a11c590d3ed64d80299b50f74838)

[compare](https://github.com/undergroundwires/privacy.sexy/compare/0.6.0...0.6.1)

## 0.6.0 (2020-07-26)

* fixed dead links in documentation | [25ce236](https://github.com/undergroundwires/privacy.sexy/commit/25ce236a7737decaf2eb9b8c29a4c4f34d43f770)
* runs tests on each push on the repository | [73c4268](https://github.com/undergroundwires/privacy.sexy/commit/73c426844a0330718a9ab7de12b61ca05e853323)
* code area now shows "how" before "why" | [4ff4b52](https://github.com/undergroundwires/privacy.sexy/commit/4ff4b52202b1c5dbfe2b80580bbe7d93132ab05c)
* support for desktop versions #20 | [04b9b59](https://github.com/undergroundwires/privacy.sexy/commit/04b9b59e14766ccd251474ad3710baf1f682fd49)
* reworked on footer & removed github icon | [60a5a2a](https://github.com/undergroundwires/privacy.sexy/commit/60a5a2aa4026d384bef9e6a203f1b7514a269c33)
* updated dependencies to latest | [45816a2](https://github.com/undergroundwires/privacy.sexy/commit/45816a2bccb3d11a50e3f2bc19c0a6cc2587deaa)

[compare](https://github.com/undergroundwires/privacy.sexy/compare/0.5.0...0.6.0)

## 0.5.0 (2020-07-19)

* added ability to revert (#21) | [9c063d5](https://github.com/undergroundwires/privacy.sexy/commit/9c063d59defa6297c64f50b49403e8bd10620de9)
* search placeholder shows total scripts | [1d5225d](https://github.com/undergroundwires/privacy.sexy/commit/1d5225de07186f853f4cf7aedd4998f5d00c107a)
* do not collapse card when on "Search" and "Select" | [dd7e141](https://github.com/undergroundwires/privacy.sexy/commit/dd7e1416b4df54bf71b719d4654db88769dc0994)
* opening a card scrolls to its content div | [31d2067](https://github.com/undergroundwires/privacy.sexy/commit/31d2067f076c3159483baec49975617dddbd158d)
* all cards in same line now have same height | [a9f9e90](https://github.com/undergroundwires/privacy.sexy/commit/a9f9e9044385d9aed3b5551fc6c6823e813fd1e5)
* patched loadash vulnerability (#18) | [92a7118](https://github.com/undergroundwires/privacy.sexy/commit/92a7118d1c5013312772e075b9ee5a79c93710b8)

[compare](https://github.com/undergroundwires/privacy.sexy/compare/0.4.10...0.5.0)

## 0.4.10 (2020-07-15)

* fixed script errors & added tests | [9e722dd](https://github.com/undergroundwires/privacy.sexy/commit/9e722ddfb3825fb29d6298025baaaa033120d017)

[compare](https://github.com/undergroundwires/privacy.sexy/compare/0.4.9...0.4.10)

## 0.4.9 (2020-07-14)

* disable office telemetry Disassembler0/Win10-Initial-Setup-Script#288 | [53cf595](https://github.com/undergroundwires/privacy.sexy/commit/53cf595e1726ee3de79137fd566978fd512d218f)
* updated to may 2020 update | [909c44d](https://github.com/undergroundwires/privacy.sexy/commit/909c44d72a4a602ee8f27d06b6ec706c1e432ce1)
* simplified docker builds | [f27a287](https://github.com/undergroundwires/privacy.sexy/commit/f27a2871d74e5117fc029be82caef12246e10879)

[compare](https://github.com/undergroundwires/privacy.sexy/compare/0.4.8...0.4.9)

## 0.4.8 (2020-07-11)

* added more scripts #16 (#17) | [d8552c6](https://github.com/undergroundwires/privacy.sexy/commit/d8552c62ffea13ce62abce836c7dd4980eef6bb9)
* stopping services before disabling #16 | [628c16e](https://github.com/undergroundwires/privacy.sexy/commit/628c16eb952495f5b3f6d794161b355f4b08b819)
* can disable features, capabilities & remove onedrive #16 | [30efbcc](https://github.com/undergroundwires/privacy.sexy/commit/30efbcc621eb83dd5a9c1e66b8f1f5350eb95006)
* updated one more typo (#19) | [d7a1325](https://github.com/undergroundwires/privacy.sexy/commit/d7a1325c0b7665ce712dc411965d00fc1d6fa384)
* more tweaks #16 | [2c4eb78](https://github.com/undergroundwires/privacy.sexy/commit/2c4eb78c3f156cb0d033977cffbe7464697680f5)

[compare](https://github.com/undergroundwires/privacy.sexy/compare/0.4.7...0.4.8)

## 0.4.7 (2020-06-30)

* removed HKU tweak as all HKU's are changed #10 | [c937af8](https://github.com/undergroundwires/privacy.sexy/commit/c937af8ee7da9aa95131e56abf7bf24800390fe6)
* Fixed types + script in "Clear Windows log files" (#15) | [461a4f1](https://github.com/undergroundwires/privacy.sexy/commit/461a4f122b342369db5cc08c5e30961c64e68cdd)

[compare](https://github.com/undergroundwires/privacy.sexy/compare/0.4.6...0.4.7)

## 0.4.6 (2020-06-16)

* Fixed Some More Issues (#12) | [52d5713](https://github.com/undergroundwires/privacy.sexy/commit/52d5713a99422cdf900aba819e49e998abac33cc)
* removed failing continuous deployment #14 | [583c566](https://github.com/undergroundwires/privacy.sexy/commit/583c5660d6ac934b845a044e013357aa91f61c15)
* Updated Some Tweaks (#11) | [0fc1845](https://github.com/undergroundwires/privacy.sexy/commit/0fc18459cde57684f00764815062f838f932aed5)
* Updated Some More Tweaks (#13) | [019b838](https://github.com/undergroundwires/privacy.sexy/commit/019b838925e963b7ec052ac76c6faf5650b9eb67)

[compare](https://github.com/undergroundwires/privacy.sexy/compare/0.4.5...0.4.6)

## 0.4.5 (2020-06-13)

[compare](https://github.com/undergroundwires/privacy.sexy/compare/0.4.4...0.4.5)

## 0.4.4 (2020-05-24)

* fixed close card button not being visible & cleanup | [0d2efe5](https://github.com/undergroundwires/privacy.sexy/commit/0d2efe5b05aa965458b78b8fa43754ce2f4fe11b)
* new footer with privacy policy | [e2ab124](https://github.com/undergroundwires/privacy.sexy/commit/e2ab124fb799f56ada3570fdc911361cb803e889)
* one command to lint everything "npm run lint" | [bb98d20](https://github.com/undergroundwires/privacy.sexy/commit/bb98d20637cbf1d524ebb2973e308773006e3153)
* fix "group by" overflows on smaller screens | [c668a97](https://github.com/undergroundwires/privacy.sexy/commit/c668a97950a1cb7c8bf2a7fd8a72d1101e65e8ce)
* clicking outside of a card closes it | [aab8f21](https://github.com/undergroundwires/privacy.sexy/commit/aab8f21a8d8dbed54798af581e6e1ad9e86a4be1)

[compare](https://github.com/undergroundwires/privacy.sexy/compare/0.4.3...0.4.4)

## 0.4.3 (2020-05-23)

* removed redundant documentation | [749a140](https://github.com/undergroundwires/privacy.sexy/commit/749a140eb8dba09cb67fec2f8dec937e66e3cff5)
* fixed broke link | [97b7e03](https://github.com/undergroundwires/privacy.sexy/commit/97b7e03233d9718a8df30cb01ce06ca9489a0295)
* simplified heading | [226074c](https://github.com/undergroundwires/privacy.sexy/commit/226074c5342f7463c06fcff1457d352ca30295a3)
* reading version from package.json instead of version file #5 | [691f989](https://github.com/undergroundwires/privacy.sexy/commit/691f989682179016ddcbf55a05cded29155288c9)
* automatically increases patch number #5 | [3e3bc07](https://github.com/undergroundwires/privacy.sexy/commit/3e3bc07576f7c7e74e3e11fc7d197cbb9a9fb8c0)
* using deployment operations from aws-static-site-with-cd | [997be71](https://github.com/undergroundwires/privacy.sexy/commit/997be7113f676888892ffa35566d9ebb58a3e9ea)
* automated using bump-everywhere + more quality checks (#8) | [4a91e8c](https://github.com/undergroundwires/privacy.sexy/commit/4a91e8ccd8a707bc6bea34ee28cff7fa4f66ee2f)

[compare](https://github.com/undergroundwires/privacy.sexy/compare/0.4.2...0.4.3)

## 0.4.2 (2020-02-29)

* added missing semicolon for masking | [e63ac4a](https://github.com/undergroundwires/privacy.sexy/commit/e63ac4ae67da68243a525af149ff30e5d485b641)
* set font on input | [0c39a06](https://github.com/undergroundwires/privacy.sexy/commit/0c39a06be5e4b0a2031ad5e9f5220dd669afee53)
* shortened all HKEY paths | [802b36b](https://github.com/undergroundwires/privacy.sexy/commit/802b36bdd8dcc1f0a2853fe7da2ea2fccd69a88c)

[compare](https://github.com/undergroundwires/privacy.sexy/compare/0.4.1...0.4.2)

## 0.4.1 (2020-01-11)

* fixed search bug | [31364bd](https://github.com/undergroundwires/privacy.sexy/commit/31364bdfec503af09ffbb58044a17dfb833fc8d9)
* hide grouping while searching | [92f1a36](https://github.com/undergroundwires/privacy.sexy/commit/92f1a36bcb1e1fe7c90efe8ccd3ede55991e9d9c)
* 👀🔍  showing search queries | [97a7747](https://github.com/undergroundwires/privacy.sexy/commit/97a7747933d2b515cc03ab8243e6a8ae702ef16a)
* more efficient queries with single lowercase | [19813b6](https://github.com/undergroundwires/privacy.sexy/commit/19813b691746d98670823025c460480400e34b6e)
* using right 🔍 input type | [0ce354e](https://github.com/undergroundwires/privacy.sexy/commit/0ce354ea0956391ad3f37b252daac1127bfc601a)

[compare](https://github.com/undergroundwires/privacy.sexy/compare/0.4.0...0.4.1)

## 0.4.0 (2020-01-11)

* 🔍 support for search | [89862b2](https://github.com/undergroundwires/privacy.sexy/commit/89862b2775703257b9dc2e19fbebde2c0d0fbda0)
* more scripts & better organized | [95baf31](https://github.com/undergroundwires/privacy.sexy/commit/95baf3175b0d2c7df516f7893a96346b94ac8eca)
* refactorings | [e3f82e0](https://github.com/undergroundwires/privacy.sexy/commit/e3f82e069e305f6d94eab335470c8e7b44295dd6)
* more margin for the scripts | [5ea46ec](https://github.com/undergroundwires/privacy.sexy/commit/5ea46ecbf52236953d19f09a8eade08b83e6cd34)

[compare](https://github.com/undergroundwires/privacy.sexy/compare/0.3.0...0.4.0)

## 0.3.0 (2020-01-09)

* added description & more descriptive title | [9957634](https://github.com/undergroundwires/privacy.sexy/commit/99576340b648550149871e2c0fe0b0d8c2dd0d7c)
* allow robots | [eee0e78](https://github.com/undergroundwires/privacy.sexy/commit/eee0e785ec2c5e6bed53d21b4126a57773e35dba)
* removed unused references | [cfd888f](https://github.com/undergroundwires/privacy.sexy/commit/cfd888f3afc5c260a0a4a73f2843b86b9f1df2cd)
* 🚫 disable NVIDIA telemetry | [ab28f4e](https://github.com/undergroundwires/privacy.sexy/commit/ab28f4ed8538d51e1777c86302a63a0cd9c3cb2a)
* backwards compatibility for fonts | [4bc13e1](https://github.com/undergroundwires/privacy.sexy/commit/4bc13e11926a6df77079646499e799742153b4ab)
* added back meta needed for responsiveness | [ed872ef](https://github.com/undergroundwires/privacy.sexy/commit/ed872ef3d9f6c92afc0ce0d06998c60463a8b4e8)
* fancy-font is renamed to main and now used | [6825001](https://github.com/undergroundwires/privacy.sexy/commit/6825001c61426194dc363b96b57a321241f3ba57)
* added support for grouping | [ec6b3c5](https://github.com/undergroundwires/privacy.sexy/commit/ec6b3c54072a77bb4305da1c234db6c649218b88)
* less hyphens as it looks better on mobile | [e0b080a](https://github.com/undergroundwires/privacy.sexy/commit/e0b080af69157f46ba12e2c25e794f5384671b51)

[compare](https://github.com/undergroundwires/privacy.sexy/compare/0.2.0...0.3.0)

## 0.2.0 (2020-01-06)

* added GitHub Actions badge for build & deploy | [a229aca](https://github.com/undergroundwires/privacy.sexy/commit/a229aca68a92bbcd8e8176ac1dd25ce03509e074)
* more badges 📛🏆📜 | [090e831](https://github.com/undergroundwires/privacy.sexy/commit/090e8319091044e53484ba8338510f6fb7c3cb80)
* typo fixes + whitespace refactorings | [e99f210](https://github.com/undergroundwires/privacy.sexy/commit/e99f210c9dcf61a21e445e2a331384b6066f2c98)
* switched content information to "why" section | [beb3c83](https://github.com/undergroundwires/privacy.sexy/commit/beb3c8339f83a224ca66ad8a911a9265ffe7c9c0)
* fixed contribution URL | [7b4277d](https://github.com/undergroundwires/privacy.sexy/commit/7b4277d7706ccf6ba7e4b7b01aa46f8e3852cfc6)
* fixed wrong relation + lighter style | [8d05b03](https://github.com/undergroundwires/privacy.sexy/commit/8d05b03c9f3c9fc015be6615da8c283809712065)
* better URL validation | [aff463d](https://github.com/undergroundwires/privacy.sexy/commit/aff463dd64fecff92a786fcba88621dff6b1cf73)
* refactoring to new function | [c646c10](https://github.com/undergroundwires/privacy.sexy/commit/c646c102730481c3f4648eb714dc0a84ce35b13c)
* optimized find queries & refactorings | [d38f6cd](https://github.com/undergroundwires/privacy.sexy/commit/d38f6cd6a8b33e11df854c7abea05974dc04d4ce)
* 🎨  styled no JS error | [c359f1d](https://github.com/undergroundwires/privacy.sexy/commit/c359f1d89c6874b3cc94154b993e33f58bd32268)
* simplified finding duplicates | [57037aa](https://github.com/undergroundwires/privacy.sexy/commit/57037aaefcc0e80f0f4719cea89568490a731028)
* fixed maintainability badge URL | [aaea47e](https://github.com/undergroundwires/privacy.sexy/commit/aaea47e7d15fe41dea26968db0107a0c53d108f3)
* fixed wrong line dumps | [5ccc7c5](https://github.com/undergroundwires/privacy.sexy/commit/5ccc7c59528885ae7729197df3dfa00f924a2b3f)
* refactorings in parsing | [2aa3742](https://github.com/undergroundwires/privacy.sexy/commit/2aa3742e30646bf1d1f3779419d161c3fb6c4808)
* using free function | [20020af](https://github.com/undergroundwires/privacy.sexy/commit/20020af7c1d8de13948d8761fd4e7f0affb2badb)
* default selection is now none | [3140cc6](https://github.com/undergroundwires/privacy.sexy/commit/3140cc663b86394d543de90228aa53e6a304d8d9)
* added hyphen lines for longer names | [cced601](https://github.com/undergroundwires/privacy.sexy/commit/cced601d686d550f4225018e5311b7433efbb5ae)
* more descriptive subtitle | [2cf9214](https://github.com/undergroundwires/privacy.sexy/commit/2cf9214b14d9720f747a71b3864ba7a28acf0ff4)
* added footer with version | [10a34fa](https://github.com/undergroundwires/privacy.sexy/commit/10a34fae2f1a219ec52db0c74edb39b46ebd8abc)
* using font variables | [60e6348](https://github.com/undergroundwires/privacy.sexy/commit/60e6348dc8d53f1e81ebdb2ec0e1962aac1e9842)
* code-gen refactorings | [246e753](https://github.com/undergroundwires/privacy.sexy/commit/246e753ddc9dc8bf630e538663584bf3423cc749)
* added text when nothing is chosen | [a7da75d](https://github.com/undergroundwires/privacy.sexy/commit/a7da75d4428090423b692ce45423f5bd300d8442)

[compare](https://github.com/undergroundwires/privacy.sexy/compare/0.1.0...0.2.0)

## 0.1.0 (2019-12-31)

Initial release | [commits](https://github.com/undergroundwires/privacy.sexy/commit/4e7f244190c6ffbf7b20443e3e69cf2402c4268a)
