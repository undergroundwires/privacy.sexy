if (-not ('PrivacySexyVmTest.ProcessPrivileges' -as [type])) {
    Add-Type -TypeDefinition @'
using System;
using System.ComponentModel;
using System.Runtime.InteropServices;
namespace PrivacySexyVmTest {
    public static class ProcessPrivileges {
        [StructLayout(LayoutKind.Sequential)]
        private struct Luid { public uint Low; public int High; }
        [StructLayout(LayoutKind.Sequential)]
        private struct Privilege { public uint Count; public Luid Id; public uint Attributes; }
        [DllImport("kernel32.dll")]
        private static extern IntPtr GetCurrentProcess();
        [DllImport("kernel32.dll")]
        private static extern bool CloseHandle(IntPtr handle);
        [DllImport("advapi32.dll", SetLastError = true)]
        private static extern bool OpenProcessToken(IntPtr process, uint access, out IntPtr token);
        [DllImport("advapi32.dll", CharSet = CharSet.Unicode, SetLastError = true)]
        private static extern bool LookupPrivilegeValue(string system, string name, out Luid id);
        [DllImport("advapi32.dll", SetLastError = true)]
        private static extern bool AdjustTokenPrivileges(IntPtr token, bool disableAll, ref Privilege state,
            int size, out Privilege previous, out int required);
        public static uint Set(string name, uint attributes) {
            IntPtr token;
            if (!OpenProcessToken(GetCurrentProcess(), 0x28, out token))
                throw new Win32Exception(Marshal.GetLastWin32Error());
            try {
                Luid id;
                if (!LookupPrivilegeValue(null, name, out id))
                    throw new Win32Exception(Marshal.GetLastWin32Error());
                Privilege state = new Privilege { Count = 1, Id = id, Attributes = attributes };
                Privilege previous;
                int required;
                if (!AdjustTokenPrivileges(token, false, ref state, Marshal.SizeOf(typeof(Privilege)), out previous, out required))
                    throw new Win32Exception(Marshal.GetLastWin32Error());
                int error = Marshal.GetLastWin32Error();
                if (error != 0) throw new Win32Exception(error);
                return previous.Count == 0 ? attributes : previous.Attributes;
            } finally { CloseHandle(token); }
        }
    }
}
'@
}
