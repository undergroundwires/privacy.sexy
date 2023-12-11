export enum OperatingSystem {
  macOS,
  Windows,
  Linux,
  KaiOS,
  ChromeOS,
  Android,
  iOS,
  iPadOS,

  /**
   * Legacy: Released in 1999, discontinued in 2013, succeeded by BlackBerry10.
   */
  BlackBerryOS,

  /**
   * Legacy: Released in 2013, discontinued in 2015, succeeded by {@link OperatingSystem.Android}.
   */
  BlackBerry10,

  /**
   * Legacy: Released in 2010, discontinued in 2017,
   * succeeded by {@link OperatingSystem.Windows10Mobile}.
   */
  WindowsPhone,

  /**
   * Legacy: Released in 2015, discontinued in 2017, succeeded by {@link OperatingSystem.Android}.
   */
  Windows10Mobile,

  /**
   * Also known as "BlackBerry PlayBook OS"
   * Legacy: Released in 2011, discontinued in 2014, succeeded by {@link OperatingSystem.Android}.
   */
  BlackBerryTabletOS,
}
