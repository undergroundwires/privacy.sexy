[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)][string]$NodePath,
    [Parameter(Mandatory = $true)][string]$ScriptPath,
    [Parameter(Mandatory = $true)][string]$ExpectedComputerName,
    [switch]$AllowFixtureDeletion
)

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
if (-not $AllowFixtureDeletion -or $env:COMPUTERNAME -cne $ExpectedComputerName) {
    throw 'Explicit fixture-deletion consent and the exact VM computer name are required.'
}
$vmComputer = Get-CimInstance Win32_ComputerSystem
if ($vmComputer.Manufacturer -notlike '*VMware*') { throw 'This harness requires a disposable VMware guest.' }
if (-not ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    throw 'Run inside the disposable VM with an elevated token.'
}

$resolvedNodePath = (Resolve-Path -LiteralPath $NodePath -ErrorAction Stop).Path
$resolvedScriptPath = (Resolve-Path -LiteralPath $ScriptPath -ErrorAction Stop).Path
if ((Get-Item -LiteralPath $resolvedNodePath).PSIsContainer -or (Get-Item -LiteralPath $resolvedScriptPath).PSIsContainer) {
    throw 'NodePath and ScriptPath must resolve to files.'
}

function Assert-TestCondition {
    param([bool]$Condition, [string]$Message)

    if (-not $Condition) { throw $Message }
}

function New-CaseFixture {
    param([string]$Name, [string]$FixtureRoot)

    $caseRoot = Join-Path $FixtureRoot $Name
    $caller = Join-Path $caseRoot 'Caller'
    $target = Join-Path $caseRoot 'Target'
    $null = [IO.Directory]::CreateDirectory($caller)
    $null = [IO.Directory]::CreateDirectory($target)
    [IO.File]::WriteAllText((Join-Path $caller 'package.json'), '{"name":"caller","private":true}')
    [IO.File]::WriteAllText((Join-Path $target 'package.json'), '{"name":"target","private":true}')
    return [pscustomobject]@{
        Root = $caseRoot
        Caller = $caller
        Target = $target
        Log = Join-Path $caseRoot 'fake-npm.log'
    }
}

function Invoke-NpmInstallHelper {
    param(
        [string]$WorkingDirectory,
        [string]$LogPath,
        [string[]]$Arguments
    )

    $previousErrorActionPreference = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'
    try {
        Set-Location -LiteralPath $WorkingDirectory
        $env:PRIVACY_SEXY_NPM_LOG = $LogPath
        $output = @(& $resolvedNodePath $resolvedScriptPath @Arguments 2>&1)
        $script:latestHelperResult = [pscustomobject]@{
            ExitCode = $LASTEXITCODE
            Output = @($output | ForEach-Object { $_.ToString() })
        }
        return $script:latestHelperResult
    } finally {
        $ErrorActionPreference = $previousErrorActionPreference
    }
}

function Get-FakeNpmCalls {
    param([string]$LogPath)

    if (-not [IO.File]::Exists($LogPath)) { return @() }
    return @([IO.File]::ReadAllLines($LogPath))
}

function Assert-InstallRanInTarget {
    param([psobject]$Result, [psobject]$Fixture)

    Assert-TestCondition ($Result.ExitCode -eq 0) "Expected exit code zero, got $($Result.ExitCode). Output: $($Result.Output -join ' | ')"
    $calls = @(Get-FakeNpmCalls $Fixture.Log)
    Assert-TestCondition ($calls.Count -eq 1) "Expected one fake npm install or ci call, got $($calls.Count)."
    $fields = $calls[0].Split("`t")
    Assert-TestCondition ($fields[0] -ieq $Fixture.Target) "Expected fake npm cwd '$($Fixture.Target)', got '$($fields[0])'."
    Assert-TestCondition ($fields[1] -in @('install', 'ci')) "Expected install or ci, got '$($fields[1])'."
    return $calls
}

$caseResults = [Collections.Generic.List[object]]::new()
function Invoke-TestCase {
    param([string]$Name, [scriptblock]$Action)

    Write-Host "CASE $Name"
    $script:latestHelperResult = $null
    try {
        $observation = & $Action
        $caseResults.Add([pscustomobject]@{ Case = $Name; Passed = $true; Observation = $observation })
    } catch {
        $failure = [ordered]@{ Case = $Name; Passed = $false; Failure = $_.Exception.Message }
        if ($null -ne $script:latestHelperResult) {
            $failure.ExitCode = $script:latestHelperResult.ExitCode
            $failure.Output = $script:latestHelperResult.Output
        }
        $caseResults.Add([pscustomobject]$failure)
    }
    Write-Host "RESULT ${Name}: $($caseResults[$caseResults.Count - 1].Passed)"
}

$fixtureRoot = Join-Path ([IO.Path]::GetTempPath()) ('privacy.sexy npm-install helper-' + [Guid]::NewGuid().ToString('N'))
if ([IO.Directory]::Exists($fixtureRoot)) { throw 'Refusing to reuse an existing fixture directory.' }
$previousPath = $env:Path
$previousLocation = (Get-Location).Path
$previousNpmLog = [Environment]::GetEnvironmentVariable('PRIVACY_SEXY_NPM_LOG', 'Process')
$fixtureCleanup = $false
$fixtureCleanupError = $null
try {
    $null = [IO.Directory]::CreateDirectory($fixtureRoot)
    $fakeBin = Join-Path $fixtureRoot 'fake-bin'
    $null = [IO.Directory]::CreateDirectory($fakeBin)
    $fakeNpmPath = Join-Path $fakeBin 'npm.exe'
    Add-Type -TypeDefinition @'
using System;
using System.IO;

namespace PrivacySexyVmNpmFake {
    public static class Program {
        public static int Main(string[] args) {
            if (args.Length == 1 && args[0] == "--version") {
                Console.WriteLine("0.0.0-vm-test");
                return 0;
            }
            if (args.Length > 0 && (args[0] == "install" || args[0] == "ci")) {
                string logPath = Environment.GetEnvironmentVariable("PRIVACY_SEXY_NPM_LOG");
                File.AppendAllText(logPath, Environment.CurrentDirectory + "\t" + String.Join("\t", args) + Environment.NewLine);
            }
            return 0;
        }
    }
}
'@ -OutputAssembly $fakeNpmPath -OutputType ConsoleApplication -ErrorAction Stop
    $env:Path = "$fakeBin;$previousPath"

    Invoke-TestCase 'root-directory-runs-npm-in-target' {
        $fixture = New-CaseFixture 'root-directory' $fixtureRoot
        $result = Invoke-NpmInstallHelper $fixture.Caller $fixture.Log @('--root-directory', $fixture.Target)
        $calls = @(Assert-InstallRanInTarget $result $fixture)
        return [pscustomobject]@{ ExitCode = $result.ExitCode; FakeNpmCalls = $calls; Output = $result.Output }
    }

    Invoke-TestCase 'fresh-removes-target-node-modules-when-caller-has-none' {
        $fixture = New-CaseFixture 'fresh-target-present' $fixtureRoot
        $targetNodeModules = Join-Path $fixture.Target 'node_modules'
        $callerNodeModules = Join-Path $fixture.Caller 'node_modules'
        $null = [IO.Directory]::CreateDirectory($targetNodeModules)
        [IO.File]::WriteAllText((Join-Path $targetNodeModules 'target.txt'), 'target')
        Assert-TestCondition (-not [IO.Directory]::Exists($callerNodeModules)) 'Caller node_modules must be absent before this case.'
        $result = Invoke-NpmInstallHelper $fixture.Caller $fixture.Log @('--root-directory', $fixture.Target, '--fresh')
        Assert-TestCondition (-not [IO.Directory]::Exists($targetNodeModules)) 'Fresh install must remove Target/node_modules.'
        Assert-TestCondition (-not [IO.Directory]::Exists($callerNodeModules)) 'Fresh install must not create Caller/node_modules.'
        $calls = @(Assert-InstallRanInTarget $result $fixture)
        return [pscustomobject]@{ ExitCode = $result.ExitCode; FakeNpmCalls = $calls; Output = $result.Output }
    }

    Invoke-TestCase 'fresh-without-target-node-modules-preserves-caller-node-modules' {
        $fixture = New-CaseFixture 'fresh-target-absent' $fixtureRoot
        $targetNodeModules = Join-Path $fixture.Target 'node_modules'
        $callerNodeModules = Join-Path $fixture.Caller 'node_modules'
        $null = [IO.Directory]::CreateDirectory($callerNodeModules)
        $callerMarker = Join-Path $callerNodeModules 'caller.txt'
        [IO.File]::WriteAllText($callerMarker, 'caller')
        $result = Invoke-NpmInstallHelper $fixture.Caller $fixture.Log @('--root-directory', $fixture.Target, '--fresh')
        $calls = @(Assert-InstallRanInTarget $result $fixture)
        Assert-TestCondition (-not [IO.Directory]::Exists($targetNodeModules)) 'Target/node_modules must remain absent.'
        Assert-TestCondition ([IO.File]::Exists($callerMarker)) 'Fresh install must not touch Caller/node_modules.'
        Assert-TestCondition ([IO.File]::ReadAllText($callerMarker) -ceq 'caller') 'Fresh install changed Caller/node_modules content.'
        return [pscustomobject]@{ ExitCode = $result.ExitCode; FakeNpmCalls = $calls; Output = $result.Output }
    }

    Invoke-TestCase 'help-does-not-invoke-npm' {
        $fixture = New-CaseFixture 'help' $fixtureRoot
        $result = Invoke-NpmInstallHelper $fixture.Caller $fixture.Log @('--help')
        $calls = @(Get-FakeNpmCalls $fixture.Log)
        Assert-TestCondition ($result.ExitCode -eq 0) "Expected help exit code zero, got $($result.ExitCode). Output: $($result.Output -join ' | ')"
        Assert-TestCondition ($calls.Count -eq 0) 'Help must not invoke npm.'
        return [pscustomobject]@{ ExitCode = $result.ExitCode; FakeNpmCalls = $calls; Output = $result.Output }
    }

    Invoke-TestCase 'unknown-flag-fails-without-npm' {
        $fixture = New-CaseFixture 'unknown-flag' $fixtureRoot
        $result = Invoke-NpmInstallHelper $fixture.Caller $fixture.Log @('--unknown-flag')
        $calls = @(Get-FakeNpmCalls $fixture.Log)
        Assert-TestCondition ($result.ExitCode -ne 0) 'Unknown flags must fail.'
        Assert-TestCondition ($calls.Count -eq 0) 'Unknown flags must not invoke npm.'
        return [pscustomobject]@{ ExitCode = $result.ExitCode; FakeNpmCalls = $calls; Output = $result.Output }
    }

    Invoke-TestCase 'missing-root-value-fails-without-npm' {
        $fixture = New-CaseFixture 'missing-root-value' $fixtureRoot
        $result = Invoke-NpmInstallHelper $fixture.Caller $fixture.Log @('--root-directory')
        $calls = @(Get-FakeNpmCalls $fixture.Log)
        Assert-TestCondition ($result.ExitCode -ne 0) 'A missing root-directory value must fail.'
        Assert-TestCondition ($calls.Count -eq 0) 'A missing root-directory value must not invoke npm.'
        return [pscustomobject]@{ ExitCode = $result.ExitCode; FakeNpmCalls = $calls; Output = $result.Output }
    }
} finally {
    $env:Path = $previousPath
    [Environment]::SetEnvironmentVariable('PRIVACY_SEXY_NPM_LOG', $previousNpmLog, 'Process')
    Set-Location -LiteralPath $previousLocation
    try {
        if ([IO.Directory]::Exists($fixtureRoot)) { [IO.Directory]::Delete($fixtureRoot, $true) }
    } catch {
        $fixtureCleanupError = $_.Exception.Message
    }
    $fixtureCleanup = -not [IO.Directory]::Exists($fixtureRoot)
}

$failedCases = @($caseResults | Where-Object { -not $_.Passed }).Count
$report = [pscustomobject]@{
    Computer = $env:COMPUTERNAME
    Cases = $caseResults.ToArray()
    Passed = $caseResults.Count - $failedCases
    Failed = $failedCases
    Expected = 6
    FixtureCleanup = $fixtureCleanup
}
if ($fixtureCleanupError) {
    $report | Add-Member -NotePropertyName FixtureCleanupError -NotePropertyValue $fixtureCleanupError
    $report | Add-Member -NotePropertyName RemainingFixtureRoot -NotePropertyValue $fixtureRoot
}
$report | ConvertTo-Json -Depth 6 -Compress
if ($failedCases -gt 0 -or $caseResults.Count -ne 6 -or -not $fixtureCleanup) { exit 1 }
