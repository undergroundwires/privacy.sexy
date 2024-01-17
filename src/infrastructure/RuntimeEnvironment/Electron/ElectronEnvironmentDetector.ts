export interface ElectronEnvironmentDetector {
  isRunningInsideElectron(): boolean;
  determineElectronProcessType(): ElectronProcessType;
}

export type ElectronProcessType = 'main' | 'preloader' | 'renderer';
