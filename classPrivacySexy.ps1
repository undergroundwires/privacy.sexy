
# region TL PRIVACY.SEXY LIB
function RunInlineCode(
    [Parameter(Mandatory = $true, ValueFromPipeline = $true)]
    $InputObject,
    $Path = "$env:TEMP\TL_Invoke-Batch.cmd"
) {

    $Content = @"
:: This batch file was generated with TweakList's Invoke-Batch
:: It is a PowerShell function designed to run a snippet of batch

"@
        
    $Lines = $InputObject -split "`n" | Where-Object { $PSItem }
    # That Where-Object filters out empty lines
    if ($Lines -notcontains "@echo off") {
        $Content += "@echo off`n"
    }
    $Content += $InputObject
    Set-Content $Path $Content -Force -ErrorAction Stop
    Unblock-File $Path -ErrorAction Stop
    $cmd = (Get-Command cmd.exe -ErrorAction Stop).Source
    & $cmd /c $Path
}

function DisableService([String]$serviceName) {

    Write-Host "Disabling service: `"$serviceName`"."
    # -- 1. Skip if service does not exist
    $service = Get-Service -Name $serviceName -ErrorAction SilentlyContinue
    if (!$service) {
        Write-Host "Service `"$serviceName`" could not be not found, no need to disable it."
        return
    }
        
    # -- 2. Stop if running
    if ($service.Status -eq [System.ServiceProcess.ServiceControllerStatus]::Running) {
        Write-Host "`"$serviceName`" is running, stopping it."
        try {
            Stop-Service -Name "$serviceName" -Force -ErrorAction Stop
            Write-Host "Stopped `"$serviceName`" successfully."
        }
        catch {
            Write-Warning "Could not stop `"$serviceName`", it will be stopped after reboot: $_"
        }
    }
    else {
        Write-Host "`"$serviceName`" is not running, no need to stop."
    }
        
    # -- 3. Skip if already disabled
    $startupType = $service.StartType # Does not work before .NET 4.6.1
    if (!$startupType) {
        $startupType = (Get-WmiObject -Query "Select StartMode From Win32_Service Where Name='$serviceName'" -ErrorAction Ignore).StartMode
        if (!$startupType) {
            $startupType = (Get-WmiObject -Class Win32_Service -Property StartMode -Filter "Name='$serviceName'" -ErrorAction Ignore).StartMode
        }
    }
    if ($startupType -eq 'Disabled') {
        Write-Host "$serviceName is already disabled, no further action is needed"
    }
    # -- 4. Disable service
    try {
        Set-Service -Name "$serviceName" -StartupType Disabled -Confirm:$false -ErrorAction Stop
        Write-Host "Disabled `"$serviceName`" successfully."
    }
    catch {
        Write-Host "Could not disable `"$serviceName`": $_" -ForegroundColor DarkRed
        return
    }
}

function UninstallStoreApp([String]$packageName, [Switch]$Revert) {

    if (!$Revert) {
        Get-AppxPackage $PackageName -ErrorAction Continue | Remove-AppxPackage -ErrorAction Continue
    }
    else {
        $package = Get-AppxPackage -AllUsers $packageName
        if (!$package) {
            Write-Host "Cannot reinstall Store (UWP) app: $packageName" -ForegroundColor DarkRed
            return
        }
        $manifest = Join-Path $package.InstallLocation AppxManifest.xml
        Add-AppxPackage -DisableDevelopmentMode -Register $manifest
    }       
}

function DisableFeature([Switch]$Revert, [String]$featureName) {

    if (!$Revert) {
        dism /Online /Disable-Feature /FeatureName:"$featureName" /NoRestart
    }
    else {
        dism /Online /Enable-Feature /FeatureName:"$featureName" /NoRestart
    }
}

function KillProcessWhenItStarts([Switch]$Revert, [String]$ProcessName) {

    if (!$Revert) {
        reg add "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Image File Execution Options\$processName" /v "Debugger" /t REG_SZ /d "%windir%\System32\taskkill.exe" /f
    }
    else {
        reg delete "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Image File Execution Options\$processName" /v "Debugger" /f
    }
            
}


function SetVSCodeSetting([String]$Key, [String]$Value, [Switch]$Revert) {

    $jsonfile = if ($env:VSCODE_SETTINGS_JSON) {
        $env:VSCODE_SETTINGS_JSON
    }
    else {
        "$env:APPDATA\Code\User\settings.json"
    }
    
    if (!(Test-Path $jsonfile -PathType Leaf)) {
        Write-Host "No updates. Settings file was not at $jsonfile"
        return
    }
    
    $json = Get-Content $jsonfile | Out-String | ConvertFrom-Json
    
    if (!$Revert) {
        $json | Add-Member -Type NoteProperty -Name $key -Value $value -Force 
    }
    else {
        $json.PSObject.Properties.Remove($key)
    }
    $json | ConvertTo-Json | Set-Content $jsonfile
}


function UninstallSystemApp([String]$packageName, [Switch]$Revert) {
        
    $package = Get-AppxPackage -AllUsers $packageName
    if (!$package) { 
        Write-Host "UWP app '$Package' not installed, skipping"
        return
    }

    $directories = @($package.InstallLocation, "$env:LOCALAPPDATA\Packages\$($package.PackageFamilyName)")

    foreach ($dir in $directories) {
        if ( !$dir -Or !(Test-Path "$dir") ) { continue }
        cmd /c ('takeown /f "' + $dir + '" /r /d y 1> nul')
        if ($LASTEXITCODE) { throw 'Failed to take ownership' }
        cmd /c ('icacls "' + $dir + '" /grant administrators:F /t 1> nul')
        if ($LASTEXITCODE) { throw 'Failed to take ownership' }
        if (!$Revert) {
            $files = Get-ChildItem -File -Path $dir -Recurse -Force
            foreach ($file in $files) {
                if ($file.Name.EndsWith('.OLD')) { continue }
                $newName = $file.FullName + '.OLD'
                Write-Host "Rename '$($file.FullName)' to '$newName'"
                Move-Item -LiteralPath "$($file.FullName)" -Destination "$newName" -Force
            }
        }
        else {
            $files = Get-ChildItem -File -Path "$dir\*.OLD" -Recurse -Force
            foreach ($file in $files) {
                $newName = $file.FullName.Substring(0, $file.FullName.Length - 4)
                Write-Host "Rename '$($file.FullName)' to '$newName'"
                Move-Item -LiteralPath "$($file.FullName)" -Destination "$newName" -Force
            }
        }

    }

}


function UninstallCapability([String]$capabilityName, [Switch]$Revert) {

    if (!$Revert) {
        Get-WindowsCapability -Online -Name $capabilityName* -ErrorAction Continue | Remove-WindowsCapability -Online -ErrorAction Continue
    }
    else {
        $capability = Get-WindowsCapability -Online -Name $capabilityName* -ErrorAction Continue
        Add-WindowsCapability -Name "$capability.Name" -Online -ErrorAction Continue
    }   
}

function RenameSystemFile([String]$Filepath, [Switch]$Revert) {
        
    if ($Revert) {
        $Filepath = "$Filepath.OLD"
        $NewFilepath = "$Filepath"
    }
    else {
        $NewFilepath = "$Filepath.OLD"
    }
    
    if (!$Revert) {
        if (-Not(Test-Path "$Filepath")) {
            Write-Host "$Filepath does not exist, skipping"
        }
        takeown /f $Filepath
        icacls $Filepath /grant administrators:F
    }
    try {
        Move-Item $Filepath $NewFilepath -Force -ErrorAction Stop
        Write-Host "Moved $Filepath back to $NewFilepath"
    }
    catch {
        Write-Host "Could restore from backup file $FilePath"
    }
}

function KillProcess(
    $processName,
    $processStartPath,
    $processStartArgs,
    [Switch]$Revert
) {
    $Process = Get-Process $processName -ErrorAction Ignore

    if (!$Revert) {
            
        if ($Process) {
            Stop-Process $Process -Force -ErrorAction Continue
        }
        else {
            Write-Host "Skipping, $processName is not running."
        }
    }
    else {
        if ($Process) {
            if ($processStartArgs) {
                Start-Process $processStartPath -ArgumentList $processStartArgs
            }
            else {
                Start-Process $processStartPath
            }
        }
        else {
            Write-Host "Skipping, $processName is already running."
        }
    }
}

function RunInlineCodeAsTrustedInstaller($command, [Switch]$Reverb) {
        
    $trustedInstallerSid = [System.Security.Principal.SecurityIdentifier]::new('S-1-5-80-956008885-3418522649-1831038044-1853292631-2271478464')
    $trustedInstallerName = $trustedInstallerSid.Translate([System.Security.Principal.NTAccount])
    $streamOutFile = New-TemporaryFile
    $batchFile = New-TemporaryFile
    try {
        $batchFile = Rename-Item $batchFile "$($batchFile.BaseName).bat" -PassThru
        "@echo off`r`n$command`r`nreturn" | Out-File $batchFile -Encoding ASCII
        $taskName = 'privacy.sexy invoke'
        schtasks.exe /delete /tn "$taskName" /f 2>&1 | Out-Null # Clean if something went wrong before, suppress any output
        $taskAction = New-ScheduledTaskAction               `
            -Execute 'cmd.exe'                              `
            -Argument "cmd /c `"$batchFile`" > $streamOutFile 2>&1"
        $settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries
        try {
            Register-ScheduledTask -TaskName $taskName -Action $taskAction -Settings $settings -Force -ErrorAction Stop | Out-Null
        }
        catch {
            Write-Host "RunInlineCodeAsTrustedInstaller: Failed registering scheduled task: $_" -ForegroundColor DarkRed
            return
        }
        try {
                ($scheduleService = New-Object -ComObject Schedule.Service).Connect()
            $scheduleService.GetFolder('\').GetTask($taskName).RunEx($null, 0, 0, $trustedInstallerName) | Out-Null
            $timeOutLimit = (Get-Date).AddMinutes(5)
            Write-Host "Running as $trustedInstallerName"
            while ((Get-ScheduledTaskInfo $taskName).LastTaskResult -eq 267009) {
                Start-Sleep -Milliseconds 200
                if ((Get-Date) -gt $timeOutLimit) {
                    Write-Warning "Skipping results, it took so long to execute script."
                    break;
                }
            }
            if (($result = (Get-ScheduledTaskInfo $taskName).LastTaskResult) -ne 0) {
                Write-Host "RunInlineCodeAsTrustedInstaller: Failed to execute with exit code: $result." -ForegroundColor DarkRed
                return
            }
        }
        catch {
            Write-Host "RunInlineCodeAsTrustedInstaller: Failed to execute ``$command``: $_" -ForegroundColor DarkRed
        }
        finally {
            schtasks.exe /delete /tn "$taskName" /f | Out-Null # Outputs only errors
        }
        Get-Content $streamOutFile
    }
    finally {
        Remove-Item $streamOutFile, $batchFile
    }
}

function DisablePerUserService(
    $serviceName,
    $defaultStartupMode
) {
    # I wasn't the one who wrote this :troll:
    # https://github.com/undergroundwires/privacy.sexy/blob/e8199932b462380741d9f2d8b6b55485ab16af02/src/application/collections/windows.yaml#L7203-L7219

    DisableServiceInRegistry -serviceQuery $serviceName $defaultStartupMode
    DisableServiceInRegistry -serviceQuery ($serviceName + '_*') $defaultStartupMode
}

    
function DisableServiceInRegistry(
    [String]$serviceName,
    [String]$defaultStartupMode,
    [Switch]$Revert
) {
    if (($Revert -and !$defaultStartupMode) -or ($defaultStartupMode -and !$Revert)) {
        # throw "DisableServiceInRegistry: defaultStartupMode and Revert need to both be passed"
    }
    
    if (!$Revert) {
        # -- 1. Skip if service does not exist
        $service = Get-Service -Name $serviceName -ErrorAction SilentlyContinue
        if (!$service) {
            Write-Host "Service query `"$serviceName`" did not yield any results, no need to disable it."
            return
        }
        $serviceName = $service.Name
        Write-Host "Disabling service: `"$serviceName`"."
        # -- 2. Stop if running
        if ($service.Status -eq [System.ServiceProcess.ServiceControllerStatus]::Running) {
            Write-Host "`"$serviceName`" is running, trying to stop it."
            try {
                Stop-Service -Name "$serviceName" -Force -ErrorAction Stop
                Write-Host "Stopped `"$serviceName`" successfully."
            }
            catch {
                Write-Warning "Could not stop `"$serviceName`", it will be stopped after reboot: $_"
            }
        }
        else {
            Write-Host "`"$serviceName`" is not running, no need to stop."
        }
        # -- 3. Skip if service info is not found in registry
        $registryKey = "HKLM:\SYSTEM\CurrentControlSet\Services\$serviceName"
        if (!(Test-Path $registryKey)) {
            Write-Host "`"$registryKey`" is not found in registry, cannot enable it."
            return
        }
        # -- 4. Skip if already disabled
        if ( $(Get-ItemProperty -Path "$registryKey").Start -eq 4) {
            Write-Host "`"$serviceName`" is already disabled from start, no further action is needed."
            return
        }
        # -- 5. Disable service
        try {
            Set-ItemProperty $registryKey -Name Start -Value 4 -Force -ErrorAction Stop
            Write-Host "Disabled `"$serviceName`" successfully."
        }
        catch {
            Write-Host "Could not disable `"$serviceName`": $_" -ForegroundColor DarkRed
            return
        }
    }
    
    
    else {
        # -- 1. Skip if service does not exist
        $service = Get-Service -Name $serviceName -ErrorAction SilentlyContinue
        if (!$service) {
            Write-Warning "Service query `"$serviceName`" did not yield and results, cannot enable it."
            return
        }
        $serviceName = $service.Name
        Write-Host "Enabling service: `"$serviceName`" with `"$defaultStartupMode`" start."
        # -- 2. Skip if service info is not found in registry
        $registryKey = "HKLM:\SYSTEM\CurrentControlSet\Services\$serviceName"
        if (!(Test-Path $registryKey)) {
            Write-Warning "`"$registryKey`" is not found in registry, cannot enable it."
            return
        }
        # -- 3. Enable if not already enabled
        $defaultStartupRegValue = `
            if ($defaultStartupMode -eq 'Boot') { '0' }           `
            elseif ($defaultStartupMode -eq 'System') { '1' }      `
            elseif ($defaultStartupMode -eq 'Automatic') { '2' }   `
            elseif ($defaultStartupMode -eq 'Manual') { '3' }      `
            else { throw "Unknown start mode: $defaultStartupMode" }
        if ( $(Get-ItemProperty -Path "$registryKey").Start -eq $defaultStartupRegValue) {
            Write-Host "`"$serviceName`" is already enabled with `"$defaultStartupMode`" start."
        }
        else { 
            try {
                Set-ItemProperty $registryKey -Name Start -Value $defaultStartupRegValue -Force
                Write-Host "Enabled `"$serviceName`" successfully with `"$defaultStartupMode`" start, may require restarting your computer."
            }
            catch {
                Write-Host "Could not enable `"$serviceName`": $_" -ForegroundColor DarkRed
                return
            }
        }
        # -- 4. Start if not running (must be enabled first)
        if ($defaultStartupMode -eq 'Automatic') {
            if ($service.Status -ne [System.ServiceProcess.ServiceControllerStatus]::Running) {
                Write-Host "`"$serviceName`" is not running, trying to start it."
                try {
                    Start-Service $serviceName -ErrorAction Stop
                    Write-Host "Started `"$serviceName`" successfully."
                }
                catch {
                    Write-Warning "Could not start `"$serviceName`", requires restart, it will be started after reboot.`r`n$_"
                }
            }
            else {
                Write-Host "`"$serviceName`" is already running, no need to start."
            }
        }
    }
}

    
function SetMpPreference(
    [String]$property,
    [String]$value,
    $default,
    $setDefaultOnWindows11,
    [Switch]$Revert
) {
    $default = $default -replace "'", "" # remove single quotes
    $value = $value -replace "'", ""
    # porting, not fixing)))
    if ($value -eq 'True') { $value = $True }
    if ($value -eq 'False') { $value = $False }
    if ($setDefaultOnWindows11 -eq 'True') { $setDefaultOnWindows11 = $True }
    if ($setDefaultOnWindows11 -eq 'False') { $setDefaultOnWindows11 = $False }
    
    if (!$Revert) {
        $propertyName = $property
        if ((Get-MpPreference -ErrorAction Ignore).$propertyName -eq $value) {
            Write-Host "SetMpPreference: Skipping. `"$propertyName`" is already `"$value`" as desired." -ForegroundColor DarkRed
            return
        }
        $command = Get-Command 'Set-MpPreference' -ErrorAction Ignore
        if (!$command) {
            Write-Warning 'SetMpPreference: Skipping. Command not found: "Set-MpPreference".' -ForegroundColor DarkRed
            return
        }
        if (!$command.Parameters.Keys.Contains($propertyName)) {
            Write-Host "SetMpPreference: Skipping. `"$propertyName`" is not supported for `"$($command.Name)`"." -ForegroundColor DarkRed
            return
        }
        try {
            Invoke-Expression "$($command.Name) -Force -$propertyName `$value -ErrorAction Stop"
            $Parameters = @{
                Force       = $True
                $property   = $value
                ErrorAction = 'Stop'
            }
            Set-MpPreference @Parameters
            Remove-Variable Parameters
            Write-Host "SetMpPreference: Successfully set `"$propertyName`" to `"$value`"." -ForegroundColor Green
            return
        }
        catch {
            if ( $_.FullyQualifiedErrorId -like '*0x800106ba*') {
                Write-Warning "SetMpPreference: Cannot $($command.Name): Defender service (WinDefend) is not running. Try to enable it (revert) and re-run this?"
                return
            }
            elseif (($_ | Out-String) -like '*Cannot convert*') {
                Write-Host "SetMpPreference: Skipping. Argument `"$value`" for property `"$propertyName`" is not supported for `"$($command.Name)`"." -ForegroundColor DarkRed
                return
            }
            else {
                Write-Host "SetMpPreference: Failed to set using $($command.Name): $_" -ForegroundColor DarkRed
                return
            }
        }
    }
    else {
        $propertyName = $property
        $defaultValue = $default
        $setDefaultOnWindows10 = [bool]$default
        # $setDefaultOnWindows11 = {{ with $setDefaultOnWindows11 }} $true # {{ end }} $false
        $osVersion = [System.Environment]::OSVersion.Version
        function Test-IsWindows10 { ($osVersion.Major -eq 10) -and ($osVersion.Build -lt 22000) }
        function Test-IsWindows11 { ($osVersion.Major -gt 10) -or (($osVersion.Major -eq 10) -and ($osVersion.Build -ge 22000)) }
        # ------ Set-MpPreference ------
        if (($setDefaultOnWindows10 -and (Test-IsWindows10)) -or ($setDefaultOnWindows11 -and (Test-IsWindows11))) {
            if ((Get-MpPreference -ErrorAction Ignore).$propertyName -eq $defaultValue) {
                Write-Host "SetMpPreference: Skipping. `"$propertyName`" is already configured as desired `"$defaultValue`"." -ForegroundColor DarkRed
                return
            }
            $command = Get-Command 'Set-MpPreference' -ErrorAction Ignore
            if (!$command) {
                Write-Warning 'SetMpPreference: Skipping. Command not found: "Set-MpPreference".'
                return
            }
            if (!$command.Parameters.Keys.Contains($propertyName)) {
                Write-Host "SetMpPreference: Skipping. `"$propertyName`" is not supported for `"$($command.Name)`"." -ForegroundColor DarkRed
                return
            }
            try {
                Invoke-Expression "$($command.Name) -Force -$propertyName `$defaultValue -ErrorAction Stop"
                Write-Host "SetMpPreference: Successfully restored `"$propertyName`" to its default `"$defaultValue`"." -ForegroundColor DarkRed
                return
            }
            catch {
                if ($_.FullyQualifiedErrorId -like '*0x800106ba*') {
                    Write-Warning "SetMpPreference: Cannot $($command.Name): Defender service (WinDefend) is not running. Try to enable it (revert) and re-run this?"
                }
                else {
                    Write-Host "SetMpPreference: Failed to set using $($command.Name): $_" -ForegroundColor DarkRed
                }
                return
            }
        }
        # ------ Remove-MpPreference ------
        $command = Get-Command 'Remove-MpPreference' -ErrorAction Ignore
        if (!$command) {
            Write-Warning 'SetMpPreference: Skipping. Command not found: "Remove-MpPreference".'
            return
        }
        if (!$command.Parameters.Keys.Contains($propertyName)) {
            Write-Host "SetMpPreference: Skipping. `"$propertyName`" is not supported for `"$($command.Name)`"."
            return
        }
        try {
            Invoke-Expression "$($command.Name) -Force -$propertyName -ErrorAction Stop"
            Write-Host "SetMpPreference: Successfully restored `"$propertyName`" to its default."
            return
        }
        catch {
            if ($_.FullyQualifiedErrorId -like '*0x800106ba*') {
                Write-Warning "SetMpPreference: Cannot $($command.Name): Defender service (WinDefend) is not running. Try to enable it (revert) and re-run this?"
                return
            }
            else {
                Write-Host "SetMpPreference: Failed to set using $($command.Name): $_" -ForegroundColor DarkRed
            }
            return
        }
    }
    
}
    
function ShowWarning(
    [String]$message,
    [Switch]$ignoreWindows11,
    [Switch]$ignoreWindows10) {
    $osVersion = [System.Environment]::OSVersion.Version
    function Test-IsWindows10 { ($osVersion.Major -eq 10) -and ($osVersion.Build -lt 22000) }
    function Test-IsWindows11 { ($osVersion.Major -gt 10) -or (($osVersion.Major -eq 10) -and ($osVersion.Build -ge 22000)) }
    if (($ignoreWindows10 -and (Test-IsWindows10)) -or ($ignoreWindows11 -and (Test-IsWindows11))) {
        return # Skip
    }
    Write-Warning "$Message"
        
}
#endregion

