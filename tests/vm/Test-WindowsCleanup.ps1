[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)][string]$PayloadPath,
    [Parameter(Mandatory = $true)][string]$ExpectedComputerName,
    [switch]$AllowFixtureDeletion,
    [string]$Case = '*'
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
$vmPayload = ConvertFrom-Json ([IO.File]::ReadAllText((Resolve-Path -LiteralPath $PayloadPath).Path))
if ($vmPayload.schema -ne 1) { throw 'Unsupported VM payload schema.' }
$vmCases = @($vmPayload.cases | Where-Object { $_.id -like $Case })
if ($vmCases.Count -eq 0) { throw 'No matching VM cases.' }
foreach ($vmCase in $vmCases) {
    if ($vmCase.id -notmatch '^[a-z0-9-]+$' -or -not $vmCase.body.Contains('%PRIVACY_SEXY_VM_FIXTURE%')) {
        throw 'Expected fixture-scoped payloads from WindowsCleanupVmPayload.spec.ts.'
    }
}
. (Join-Path $PSScriptRoot 'WindowsCleanupVmFixtures.ps1')
. (Join-Path $PSScriptRoot 'WindowsCleanupVmAssertions.ps1')
. (Join-Path $PSScriptRoot 'WindowsCleanupVmToken.ps1')

$vmBase = Join-Path ([IO.Path]::GetTempPath()) ('privacy.sexy VM fixtures-' + [Guid]::NewGuid().ToString('N'))
if ([IO.Directory]::Exists($vmBase)) { throw 'Refusing to reuse an existing fixture directory.' }
$null = [IO.Directory]::CreateDirectory($vmBase)
$vmOldEnvironment = $env:PRIVACY_SEXY_VM_FIXTURE
$env:PRIVACY_SEXY_VM_FIXTURE = $vmBase
$vmAclRestore = [Collections.Generic.List[hashtable]]::new()
$vmLinks = [Collections.Generic.List[hashtable]]::new()
$vmOpenHandles = [Collections.Generic.List[IDisposable]]::new()
$vmResults = [Collections.Generic.List[object]]::new()
$vmCleanupErrors = [Collections.Generic.List[string]]::new()
$vmTail = '; [pscustomobject]@{ VmFixtureResult = $true; Deleted = $deletedCount; Failed = $failedCount; Absent = $absentCount; Reparse = $linkCount; Preserved = $skippedCount; RepairAttempts = $(if (Get-Variable repairAttempted -Scope Local -ErrorAction SilentlyContinue) { $repairAttempted.Count } else { 0 }); CallbackCount = $(if (Get-Variable vmCallbackCount -Scope Local -ErrorAction SilentlyContinue) { $vmCallbackCount } else { 0 }) }'
try {
    foreach ($vmCase in $vmCases) {
        Write-Host "CASE $($vmCase.id)"
        $vmState = $null
        $vmFailure = $null
        $vmStats = [Collections.Generic.List[object]]::new()
        $vmMessages = [Collections.Generic.List[string]]::new()
        $vmRuntimeErrors = [Collections.Generic.List[string]]::new()
        $vmObservation = @{ Enumerations = 0; FirstDeleteDirectoryCount = $null; FirstDeleteMs = $null }
        $vmWatch = [Diagnostics.Stopwatch]::new()
        $vmPrivilegeState = @{}
        try {
            $vmState = New-VmFixture $vmBase $vmCase.id
            foreach ($vmPrivilege in @('SeBackupPrivilege', 'SeRestorePrivilege')) {
                $vmPrivilegeState[$vmPrivilege] = [PrivacySexyVmTest.ProcessPrivileges]::Set($vmPrivilege, 0)
            }
            $vmScript = [ScriptBlock]::Create('$ErrorActionPreference = "Continue"; ' + $vmCase.body + $vmTail)
            $vmWatch.Start()
            & $vmScript *>&1 | ForEach-Object {
                if ($_.PSObject.Properties['VmFixtureResult'] -and $_.VmFixtureResult) {
                    $vmStats.Add($_)
                } else {
                    $vmText = $_.ToString()
                    $vmMessages.Add($vmText)
                    if ($_ -is [System.Management.Automation.ErrorRecord]) { $vmRuntimeErrors.Add($vmText) }
                    if ($vmText.StartsWith('Enumerating directory: ')) { $vmObservation.Enumerations++ }
                    if ($vmText.StartsWith('Deleted (') -and $null -eq $vmObservation.FirstDeleteMs) {
                        $vmObservation.FirstDeleteMs = $vmWatch.Elapsed.TotalMilliseconds
                        $vmObservation.FirstDeleteDirectoryCount = $vmObservation.Enumerations
                    }
                }
            }
            $vmWatch.Stop()
            Assert-VmCondition ($vmStats.Count -eq 1) 'Generated code did not return its completion marker.'
            Assert-VmCondition ($vmRuntimeErrors.Count -eq 0) ('Uncaught PowerShell errors: ' + ($vmRuntimeErrors -join '; '))
            Assert-VmFixture $vmCase.id $vmState @{ Stats = $vmStats[0]; Observation = $vmObservation }
        } catch {
            $vmFailure = $_.Exception.Message
        } finally {
            $vmWatch.Stop()
            foreach ($vmPrivilege in $vmPrivilegeState.Keys) {
                $null = [PrivacySexyVmTest.ProcessPrivileges]::Set($vmPrivilege, $vmPrivilegeState[$vmPrivilege])
            }
            if ($vmState -and $vmState.Handle) { $vmState.Handle.Dispose() }
        }
        $vmResult = [ordered]@{
            Case = $vmCase.id; Passed = ($null -eq $vmFailure); Failure = $vmFailure
            ElapsedMs = [Math]::Round($vmWatch.Elapsed.TotalMilliseconds, 2)
            Observation = $vmObservation; Stats = @($vmStats.ToArray())
            InitialBypassPrivileges = $vmPrivilegeState
        }
        if ($vmFailure) { $vmResult.Log = $vmMessages.ToArray() }
        $vmResults.Add([pscustomobject]$vmResult)
        Write-Host "RESULT $($vmCase.id): $($vmResult.Passed)"
    }
} finally {
    foreach ($vmHandle in $vmOpenHandles) { $vmHandle.Dispose() }
    for ($i = $vmAclRestore.Count - 1; $i -ge 0; $i--) {
        $vmSaved = $vmAclRestore[$i]
        try {
            if (Test-Path -LiteralPath $vmSaved.Path) {
                $vmAcl = Get-Acl -LiteralPath $vmSaved.Path
                $vmAcl.SetSecurityDescriptorSddlForm($vmSaved.Sddl)
                Set-Acl -LiteralPath $vmSaved.Path -AclObject $vmAcl
            }
        } catch { $vmCleanupErrors.Add("ACL restoration: $($vmSaved.Path): $_") }
    }
    foreach ($vmLink in $vmLinks) {
        try {
            if ($vmLink.Directory) { [IO.Directory]::Delete($vmLink.Path, $false) } else { [IO.File]::Delete($vmLink.Path) }
        } catch [IO.DirectoryNotFoundException] {
        } catch [IO.FileNotFoundException] {
        } catch { $vmCleanupErrors.Add("Link removal: $($vmLink.Path): $_") }
    }
    try {
        if ($vmCleanupErrors.Count -eq 0) {
            Get-ChildItem -LiteralPath $vmBase -Force -Recurse | ForEach-Object {
                if ($_.Attributes -band [IO.FileAttributes]::ReadOnly) {
                    [IO.File]::SetAttributes($_.FullName, $_.Attributes -band (-bnot [IO.FileAttributes]::ReadOnly))
                }
            }
            [IO.Directory]::Delete($vmBase, $true)
        }
    } catch { $vmCleanupErrors.Add("Fixture removal: $vmBase : $_") }
    $env:PRIVACY_SEXY_VM_FIXTURE = $vmOldEnvironment
}
$vmFailed = @($vmResults | Where-Object { -not $_.Passed }).Count
$vmReport = @{
    Computer = $env:COMPUTERNAME; Windows = [Environment]::OSVersion.Version.ToString()
    PowerShell = $PSVersionTable.PSVersion.ToString(); Cases = $vmResults.ToArray()
    PayloadTokenPolicy = 'SeBackupPrivilege and SeRestorePrivilege disabled only during each payload'
    Passed = $vmResults.Count - $vmFailed; Failed = $vmFailed; Expected = $vmCases.Count
    FixtureCleanup = (-not [IO.Directory]::Exists($vmBase)); CleanupErrors = $vmCleanupErrors.ToArray()
}
if ($vmCleanupErrors.Count -gt 0) { $vmReport.RemainingFixtureRoot = $vmBase }
$vmReport | ConvertTo-Json -Depth 8 -Compress
if ($vmFailed -gt 0 -or $vmResults.Count -ne $vmCases.Count -or -not $vmReport.FixtureCleanup) { exit 1 }
