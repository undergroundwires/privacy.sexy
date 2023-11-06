import { OperatingSystem } from '@/domain/OperatingSystem';

export interface IInstructionListData {
  readonly operatingSystem: OperatingSystem;
  readonly steps: readonly IInstructionListStep[];
}

export interface IInstructionListStep {
  readonly action: IInstructionInfo;
  readonly code?: IInstructionInfo;
}

export interface IInstructionInfo {
  readonly instruction: string;
  readonly details?: string;
}
