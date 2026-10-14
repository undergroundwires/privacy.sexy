/* eslint-disable vue/max-len */

/* Ignore errors specific to host environment, rather than application execution */
export const STDERR_IGNORE_PATTERNS: readonly RegExp[] = [
  /*
    OS: Linux
    Background:
      GLIBC and libgiolibproxy.so were seen on local Linux (Ubuntu-based) installation.
    Original logs:
      /snap/core20/current/lib/x86_64-linux-gnu/libstdc++.so.6: version `GLIBCXX_3.4.29' not found (required by /lib/x86_64-linux-gnu/libproxy.so.1)
      Failed to load module: /home/bob/snap/code/common/.cache/gio-modules/libgiolibproxy.so
      [334053:0829/122143.595703:ERROR:browser_main_loop.cc(274)] GLib: Failed to set scheduler settings: Operation not permitted
  */
  /libstdc\+\+\.so.*?GLIBCXX_.*?not found/,
  /Failed to load module: .*?libgiolibproxy\.so/,
  /\[.*?:ERROR:browser_main_loop\.cc.*?\] GLib: Failed to set scheduler settings: Operation not permitted/,

  /*
    OS: macOS
    Background:
      Observed when running on GitHub runner, but not on local macOS environment.
    Original logs:
      [1571:0828/162611.460587:ERROR:trust_store_mac.cc(844)] Error parsing certificate:
      ERROR: Failed parsing extensions
  */
  /ERROR:trust_store_mac\.cc.*?Error parsing certificate:/,
  /ERROR: Failed parsing extensions/,

  /*
    OS: Linux and macOS Intel (GitHub Actions)
    Background:
      These errors occur during during Electron's GPU process initialization. Common in headless CI/CD environments.
      Not indicative of a problem in typical desktop environments.
      The macOS Intel runner renders successfully after EGL fallback; startup log checks remain required.
    Original logs:
      [3548:0828/162502.835833:ERROR:viz_main_impl.cc(186)] Exiting GPU process due to errors during initialization
      [3627:0828/162503.133178:ERROR:viz_main_impl.cc(186)] Exiting GPU process due to errors during initialization
      [3621:0828/162503.420173:ERROR:command_buffer_proxy_impl.cc(128)] ContextResult::kTransientFailure: Failed to send GpuControl.CreateCommandBuffer.
  */
  /ERROR:(?:components\/viz\/service\/main\/)?viz_main_impl\.cc.*?Exiting GPU process due to errors during initialization/,
  /ERROR:(?:gpu\/ipc\/client\/)?command_buffer_proxy_impl\.cc.*?ContextResult::kTransientFailure: Failed to send GpuControl\.CreateCommandBuffer\./,
  /ERROR:ui\/gl\/gl_display\.cc:\d+\] Initialization of all \(1\) EGL display types failed\.$/,
  /ERROR:ui\/gl\/init\/gl_initializer_mac\.cc:\d+\] GLDisplayEGL::Initialize failed\.$/,

  /*
   OS: macOS (GitHub Actions)
   Background:
      Time Machine backup service XPC connection errors occur in CI environments.
      These errors happen because Electron apps on macOS automatically attempt to
      connect to system services even when they're not available in CI.
   Original logs:
      2025-04-07 09:31:01.530 privacy.sexy Helper[15420:39156] XPC error for connection com.apple.backupd.sandbox.xpc: Connection invalid
      2025-04-07 09:31:01.530 privacy.sexy Helper[15420:39151] XPC error for connection com.apple.backupd.sandbox.xpc: Connection invalid
  */
  /privacy\.sexy Helper\[\d+:\d+\] XPC error for connection com\.apple\.backupd\.sandbox\.xpc: Connection invalid/,
];
