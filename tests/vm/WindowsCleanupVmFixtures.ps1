function New-VmFixtureFile([string]$Path, [string]$Text = 'fixture') {
    $null = [IO.Directory]::CreateDirectory([IO.Path]::GetDirectoryName($Path))
    [IO.File]::WriteAllText($Path, $Text)
}

function Set-VmFixtureAcl([string]$Path, [string]$Mode) {
    $acl = Get-Acl -LiteralPath $Path -ErrorAction Stop
    $vmAclRestore.Add(@{ Path = $Path; Sddl = $acl.Sddl })
    $everyone = [Security.Principal.SecurityIdentifier]::new('S-1-1-0')
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent().User
    switch ($Mode) {
        'deny-delete' { $rights = [Security.AccessControl.FileSystemRights]::Delete }
        'deny-children' { $rights = [Security.AccessControl.FileSystemRights]::DeleteSubdirectoriesAndFiles }
        'deny-list' { $rights = [Security.AccessControl.FileSystemRights]::ListDirectory }
        'restrict' {
            $acl.SetAccessRuleProtection($true, $false)
            $rights = [Security.AccessControl.FileSystemRights]'ReadAttributes, ReadPermissions, ChangePermissions, TakeOwnership, Synchronize'
            $acl.AddAccessRule([Security.AccessControl.FileSystemAccessRule]::new($currentUser, $rights, 'Allow'))
        }
        'protect-child' { $acl.SetAccessRuleProtection($true, $true) }
        default { throw "Unknown fixture ACL mode: $Mode" }
    }
    if ($Mode.StartsWith('deny-')) {
        $acl.AddAccessRule([Security.AccessControl.FileSystemAccessRule]::new($everyone, $rights, 'Deny'))
    }
    Set-Acl -LiteralPath $Path -AclObject $acl -ErrorAction Stop
}

function New-VmFixtureLink([string]$Path, [string]$Target, [string]$Type = 'Junction') {
    $null = New-Item -ItemType $Type -Path $Path -Target $Target -ErrorAction Stop
    $vmLinks.Add(@{ Path = $Path; Directory = ($Type -eq 'Junction') })
}

function New-VmFixture([string]$Base, [string]$Id) {
    $root = Join-Path $Base $Id
    $state = @{ Root = $root; Handle = $null; ExpectedDirectories = 0 }
    if ($Id -ne 'missing') { $null = [IO.Directory]::CreateDirectory($root) }
    switch ($Id) {
        'normal' {
            New-VmFixtureFile (Join-Path $root 'name & [1] %PATH% $value.txt')
            New-VmFixtureFile (Join-Path $root 'child[1]\nested.txt')
            New-VmFixtureFile (Join-Path $root ('child[1]\readonly-' + [char]0x03A9 + '.txt'))
            $file = Join-Path $root ('child[1]\readonly-' + [char]0x03A9 + '.txt')
            [IO.File]::SetAttributes($file, [IO.FileAttributes]'ReadOnly, Hidden, System')
            [IO.File]::SetAttributes((Join-Path $root 'child[1]'), [IO.FileAttributes]'ReadOnly, Hidden')
        }
        'contents' {
            New-VmFixtureFile (Join-Path $root 'a.txt')
            New-VmFixtureFile (Join-Path $root 'child\b.txt')
            $null = [IO.Directory]::CreateDirectory((Join-Path $root 'empty'))
        }
        'files' {
            New-VmFixtureFile (Join-Path $root 'a[1].txt')
            New-VmFixtureFile (Join-Path $root 'a1.txt')
            New-VmFixtureFile (Join-Path $root 'child\keep.txt')
        }
        'empty' { }
        'missing' { }
        'multiple' {
            New-VmFixtureFile (Join-Path $root 'cacheA\a.txt')
            New-VmFixtureFile (Join-Path $root 'cacheB\b.txt')
            New-VmFixtureFile (Join-Path $root 'other\keep.txt')
        }
        'deep-wide' {
            for ($i = 0; $i -lt 1200; $i++) { New-VmFixtureFile (Join-Path $root "file-$i.txt") }
            foreach ($branch in @('branch-a', 'branch-b')) {
                $directory = Join-Path $root $branch
                $null = [IO.Directory]::CreateDirectory($directory)
                for ($i = 0; $i -lt 40; $i++) {
                    $directory = Join-Path $directory 'd'
                    $null = [IO.Directory]::CreateDirectory($directory)
                }
                New-VmFixtureFile (Join-Path $directory 'leaf.txt')
            }
            $state.ExpectedDirectories = 83
        }
        'locked' {
            New-VmFixtureFile (Join-Path $root 'locked.txt')
            New-VmFixtureFile (Join-Path $root 'free.txt')
            $state.Handle = [IO.File]::Open((Join-Path $root 'locked.txt'), 'Open', 'ReadWrite', 'None')
            $vmOpenHandles.Add($state.Handle)
        }
        { $_ -in @('deny-no-repair', 'deny-repair', 'repair-file') } {
            $file = Join-Path $root 'denied.txt'
            New-VmFixtureFile $file
            Set-VmFixtureAcl $root 'deny-children'
            if ($Id -eq 'repair-file') { Set-VmFixtureAcl $file 'restrict'
            } else { Set-VmFixtureAcl $file 'deny-delete' }
            $state.ExpectedSddl = (Get-Acl -LiteralPath $file).Sddl
        }
        { $_ -in @('deny-enumeration', 'repair-enumeration', 'combined-denial') } {
            $restricted = Join-Path $root 'restricted'
            $file = Join-Path $restricted 'keep.txt'
            New-VmFixtureFile $file
            New-VmFixtureFile (Join-Path $root 'free.txt')
            if ($Id -eq 'deny-enumeration') { Set-VmFixtureAcl $restricted 'deny-list'
            } else {
                Set-VmFixtureAcl $file 'protect-child'
                Set-VmFixtureAcl $restricted 'restrict'
                if ($Id -eq 'combined-denial') {
                    Set-VmFixtureAcl $restricted 'deny-delete'
                    Set-VmFixtureAcl $root 'deny-children'
                }
            }
        }
        { $_ -in @('junctions', 'root-junction', 'ancestor-junction', 'file-symlink') } {
            $outside = Join-Path $Base "outside-$Id"
            New-VmFixtureFile (Join-Path $outside 'sentinel.txt') 'protected sentinel'
            New-VmFixtureFile (Join-Path $outside 'child\sentinel.txt') 'protected child'
            $state.Outside = $outside
            switch ($Id) {
                'junctions' {
                    New-VmFixtureFile (Join-Path $root 'free.txt')
                    New-VmFixtureLink (Join-Path $root 'external') $outside
                    New-VmFixtureLink (Join-Path $root 'cycle') $root
                }
                { $_ -in @('root-junction', 'ancestor-junction') } {
                    New-VmFixtureLink (Join-Path $root 'alias') $outside
                }
                'file-symlink' {
                    New-VmFixtureFile (Join-Path $root 'free.txt')
                    New-VmFixtureLink (Join-Path $root 'link.txt') (Join-Path $outside 'sentinel.txt') 'SymbolicLink'
                }
            }
        }
        'callbacks' {
            New-VmFixtureFile (Join-Path $root 'delete.txt')
            New-VmFixtureFile (Join-Path $root 'protected.keep')
            $null = [IO.Directory]::CreateDirectory((Join-Path $root 'empty'))
        }
        'changing-tree' { New-VmFixtureFile (Join-Path $root 'original.txt') }
        'onedrive-callback' {
            New-VmFixtureFile (Join-Path $root 'visible.txt')
            New-VmFixtureFile (Join-Path $root 'hidden-folder\hidden.txt')
            [IO.File]::SetAttributes((Join-Path $root 'hidden-folder\hidden.txt'), [IO.FileAttributes]::Hidden)
            $null = [IO.Directory]::CreateDirectory((Join-Path $root 'empty'))
        }
        default { throw "Unknown VM fixture: $Id" }
    }
    return $state
}
