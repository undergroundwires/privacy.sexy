function Assert-VmCondition([bool]$Condition, [string]$Message) {
    if (-not $Condition) { throw $Message }
}

function Assert-VmFixture([string]$Id, [hashtable]$State, [hashtable]$Run) {
    $root = $State.Root
    $stats = $Run.Stats
    switch ($Id) {
        { $_ -in @('normal', 'empty', 'deep-wide', 'repair-file', 'repair-enumeration') } {
            Assert-VmCondition (-not [IO.Directory]::Exists($root)) 'Selected directory was not removed.'
            Assert-VmCondition ($stats.Failed -eq 0) 'Unexpected failure count.'
            $expected = @{ normal = 5; empty = 1; 'deep-wide' = 1285; 'repair-file' = 2; 'repair-enumeration' = 4 }
            Assert-VmCondition ($stats.Deleted -eq $expected[$Id]) "Wrong deletion count: $($stats.Deleted)"
            if ($Id.StartsWith('repair-')) { Assert-VmCondition ($stats.RepairAttempts -eq 1) 'Expected one permission repair.' }
            if ($Id -eq 'deep-wide') {
                Assert-VmCondition ($null -ne $Run.Observation.FirstDeleteDirectoryCount) 'No deletion progress was observed.'
                Assert-VmCondition ($Run.Observation.Enumerations -eq $State.ExpectedDirectories) 'Enumeration instrumentation did not observe the full known tree.'
                Assert-VmCondition ($Run.Observation.FirstDeleteDirectoryCount -ge 1) 'Deletion progress lacked an observed directory enumeration.'
                Assert-VmCondition ($Run.Observation.FirstDeleteDirectoryCount -lt $State.ExpectedDirectories) 'Deletion waited for a complete tree enumeration.'
            }
        }
        'contents' {
            Assert-VmCondition ([IO.Directory]::Exists($root)) 'Contents cleanup deleted its root.'
            Assert-VmCondition ([IO.Directory]::GetFileSystemEntries($root).Length -eq 0) 'Contents cleanup left entries.'
            Assert-VmCondition ($stats.Deleted -eq 4 -and $stats.Failed -eq 0) 'Wrong contents-cleanup summary.'
        }
        'files' {
            Assert-VmCondition ([IO.File]::Exists((Join-Path $root 'child\keep.txt'))) 'File-only cleanup touched descendants.'
            Assert-VmCondition (-not [IO.File]::Exists((Join-Path $root 'a[1].txt'))) 'Bracket filename was not deleted literally.'
            Assert-VmCondition ($stats.Deleted -eq 2 -and $stats.Preserved -eq 1 -and $stats.Failed -eq 0) 'Wrong file-only summary.'
        }
        'missing' {
            Assert-VmCondition ($stats.Absent -ge 1 -and $stats.Deleted -eq 0 -and $stats.Failed -eq 0) 'Missing target was not reported correctly.'
        }
        'multiple' {
            Assert-VmCondition (-not [IO.Directory]::Exists((Join-Path $root 'cacheA'))) 'First wildcard root remains.'
            Assert-VmCondition (-not [IO.Directory]::Exists((Join-Path $root 'cacheB'))) 'Second wildcard root remains.'
            Assert-VmCondition ([IO.File]::Exists((Join-Path $root 'other\keep.txt'))) 'Unmatched sibling was touched.'
            Assert-VmCondition ($stats.Deleted -eq 4 -and $stats.Failed -eq 0) 'Wrong wildcard-root summary.'
        }
        'locked' {
            Assert-VmCondition ([IO.File]::Exists((Join-Path $root 'locked.txt'))) 'Locked file unexpectedly disappeared.'
            Assert-VmCondition (-not [IO.File]::Exists((Join-Path $root 'free.txt'))) 'An independent file was not processed.'
            Assert-VmCondition ($stats.Failed -eq 2 -and $stats.RepairAttempts -eq 0) 'A sharing violation was retried as an ACL error.'
        }
        { $_ -in @('deny-no-repair', 'deny-repair') } {
            $file = Join-Path $root 'denied.txt'
            Assert-VmCondition ([IO.File]::Exists($file)) 'Explicit delete denial was not retained.'
            Assert-VmCondition ($stats.Failed -eq 1) 'Expected one denied-file failure.'
            $attempts = if ($Id -eq 'deny-repair') { 1 } else { 0 }
            Assert-VmCondition ($stats.RepairAttempts -eq $attempts) 'Permission opt-in or one-shot bound failed.'
            if ($Id -eq 'deny-no-repair') {
                Assert-VmCondition ((Get-Acl -LiteralPath $file).Sddl -eq $State.ExpectedSddl) 'ACL changed without opt-in.'
            }
        }
        'deny-enumeration' {
            Assert-VmCondition ([IO.Directory]::Exists((Join-Path $root 'restricted'))) 'Denied directory was removed.'
            Assert-VmCondition (-not [IO.File]::Exists((Join-Path $root 'free.txt'))) 'Enumeration failure blocked an independent sibling.'
            Assert-VmCondition ($stats.RepairAttempts -eq 1 -and $stats.Failed -eq 2) 'Enumeration denial was not bounded.'
        }
        'combined-denial' {
            Assert-VmCondition ([IO.Directory]::Exists((Join-Path $root 'restricted'))) 'Explicit directory delete denial was not retained.'
            Assert-VmCondition (-not [IO.File]::Exists((Join-Path $root 'restricted\keep.txt'))) 'Repaired enumeration did not process its child.'
            Assert-VmCondition ($stats.RepairAttempts -eq 1 -and $stats.Failed -eq 2) 'Enumeration and deletion repaired the same path more than once.'
        }
        { $_ -in @('junctions', 'root-junction', 'ancestor-junction', 'file-symlink') } {
            Assert-VmCondition ([IO.File]::ReadAllText((Join-Path $State.Outside 'sentinel.txt')) -eq 'protected sentinel') 'Link target was modified.'
            Assert-VmCondition ([IO.File]::ReadAllText((Join-Path $State.Outside 'child\sentinel.txt')) -eq 'protected child') 'Ancestor-link target was modified.'
            $expected = if ($Id -eq 'junctions') { 2 } else { 1 }
            Assert-VmCondition ($stats.Reparse -eq $expected -and $stats.RepairAttempts -eq 0) 'Reparse handling or repair exclusion failed.'
            $names = switch ($Id) {
                'junctions' { 'external'; 'cycle' }
                'file-symlink' { 'link.txt' }
                default { 'alias' }
            }
            foreach ($name in $names) {
                Assert-VmCondition ([IO.File]::GetAttributes((Join-Path $root $name)) -band [IO.FileAttributes]::ReparsePoint) 'A protected link object was removed or replaced.'
            }
            if ($Id -in @('junctions', 'file-symlink')) {
                Assert-VmCondition (-not [IO.File]::Exists((Join-Path $root 'free.txt'))) 'Link preservation blocked an independent file.'
            } else { Assert-VmCondition ($stats.Deleted -eq 0) 'A linked root or ancestor was traversed.' }
        }
        'callbacks' {
            Assert-VmCondition ([IO.File]::Exists((Join-Path $root 'protected.keep'))) 'Callback continue did not preserve its file.'
            Assert-VmCondition (-not [IO.File]::Exists((Join-Path $root 'delete.txt'))) 'Callback blocked an independent file.'
            Assert-VmCondition ($stats.CallbackCount -eq 4 -and $stats.Preserved -eq 1 -and $stats.Failed -eq 1) 'Callback scope or postorder behavior failed.'
        }
        'changing-tree' {
            Assert-VmCondition ([IO.File]::Exists((Join-Path $root 'late.txt'))) 'New content was recursively retried.'
            Assert-VmCondition (-not [IO.File]::Exists((Join-Path $root 'original.txt'))) 'Original file was not deleted.'
            Assert-VmCondition ($stats.Failed -eq 1 -and $Run.Observation.Enumerations -eq 1) 'Changing tree was rescanned.'
        }
        'onedrive-callback' {
            Assert-VmCondition ([IO.File]::Exists((Join-Path $root 'visible.txt'))) 'OneDrive callback removed user data.'
            Assert-VmCondition ([IO.File]::Exists((Join-Path $root 'hidden-folder\hidden.txt'))) 'OneDrive callback removed hidden data.'
            Assert-VmCondition (-not [IO.Directory]::Exists((Join-Path $root 'empty'))) 'OneDrive callback failed to remove an empty directory.'
            Assert-VmCondition ($stats.Deleted -eq 1 -and $stats.Preserved -eq 4 -and $stats.Failed -eq 0) 'OneDrive preservation summary is wrong.'
        }
        default { throw "No assertion for fixture: $Id" }
    }
}
