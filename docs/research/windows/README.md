# Research on Windows

In this section, we maintain a structured approach to our research on Windows.
The use of `01` prefixed file names aids in organizing and retrieving search results effectively.

## Apps

The PowerShell script below serves as a method for gathering detailed information about Windows packages.

```ps1
$allPackages = @()
$provisionedPackages = Get-AppxProvisionedPackage -Online
foreach ($installedPackage in Get-AppxPackage -AllUsers) {
if ($installedPackage.IsFramework -eq $true) {
    continue
}
$allPackages += [PSCustomObject]@{
    Name = $installedPackage.Name
    PublisherId = $installedPackage.PublisherId
    Category = if ($installedPackage.SignatureKind -eq "System") {
        'System'
    } elseif ($provisionedPackages | Where-Object { $_.DisplayName -eq $installedPackage.Name }) {
        'Provisioned'
    } else {
        'Installed'
    }
    NonRemovable = $installedPackage.NonRemovable
}
}
foreach ($provisionedPackage in $provisionedPackages) {
    if ($allPackages | Where-Object { $_.Name -eq $provisionedPackage.DisplayName }) {
        continue
    }
    $allPackages += [PSCustomObject]@{
        Name = $provisionedPackage.DisplayName
        PublisherId = $provisionedPackage.PackageName -split '_' | Select-Object -Last 1
        Category = 'Provisioned'
        NonRemovable = $false
    }
}
$allPackages `
    | Sort-Object Name `
    | Select-Object Name, PublisherId, Category, NonRemovable `
    | Format-Table `
    | Out-File -FilePath "$([System.Environment]::GetFolderPath('Desktop'))\apps.txt"
```
