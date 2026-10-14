import { describe, it, expect } from 'vitest';
import { STDERR_IGNORE_PATTERNS } from '@tests/checks/desktop-runtime-errors/check-desktop-runtime-errors/app/error-ignore-patterns';

describe('desktop stderr ignore patterns', () => {
  it.each([
    '[29829:0914/164540.608054:ERROR:ui/gl/gl_display.cc:665] '
      + 'Initialization of all (1) EGL display types failed.',
    '[29829:0914/164540.608502:ERROR:ui/gl/init/gl_initializer_mac.cc:127] '
      + 'GLDisplayEGL::Initialize failed.',
    '[29829:0914/164540.780721:ERROR:components/viz/service/main/viz_main_impl.cc:190] '
      + 'Exiting GPU process due to errors during initialization',
  ])('recognizes the observed headless macOS GPU initialization message: %s', (stderr) => {
    const ignored = STDERR_IGNORE_PATTERNS.some((pattern) => pattern.test(stderr));
    expect(ignored).to.equal(true);
  });

  it.each([
    '[29829:0914/164540.608054:ERROR:ui/gl/gl_display.cc:665] Unexpected display failure.',
    '[29829:0914/164540.608502:ERROR:ui/gl/init/gl_initializer_mac.cc:127] '
      + 'Unexpected initialization failure.',
  ])('keeps other GL errors visible: %s', (stderr) => {
    const ignored = STDERR_IGNORE_PATTERNS.some((pattern) => pattern.test(stderr));
    expect(ignored).to.equal(false);
  });

  it('recognizes the transient command-buffer failure with the Chromium source path', () => {
    // arrange
    const stderr = '[46339:0914/130805.595320:ERROR:gpu/ipc/client/command_buffer_proxy_impl.cc:285] '
      + 'ContextResult::kTransientFailure: Failed to send GpuControl.CreateCommandBuffer.';
    // act
    const ignored = STDERR_IGNORE_PATTERNS.some((pattern) => pattern.test(stderr));
    // assert
    expect(ignored).to.equal(true);
  });

  it('keeps unrelated command-buffer errors visible', () => {
    // arrange
    const stderr = '[46339:0914/130805.595320:ERROR:gpu/ipc/client/command_buffer_proxy_impl.cc:285] '
      + 'ContextResult::kFatalFailure: Failed to send GpuControl.CreateCommandBuffer.';
    // act
    const ignored = STDERR_IGNORE_PATTERNS.some((pattern) => pattern.test(stderr));
    // assert
    expect(ignored).to.equal(false);
  });
});
