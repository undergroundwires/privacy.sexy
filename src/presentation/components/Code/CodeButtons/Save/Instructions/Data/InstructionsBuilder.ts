import { OperatingSystem } from '@/domain/OperatingSystem';
import { IInstructionListData, IInstructionListStep } from '../InstructionListData';

export interface IInstructionsBuilderData {
  readonly fileName: string;
}

export type InstructionStepBuilderType = (data: IInstructionsBuilderData) => IInstructionListStep;

export class InstructionsBuilder {
  private readonly stepBuilders = new Array<InstructionStepBuilderType>();

  constructor(private readonly os: OperatingSystem) {

  }

  public withStep(stepBuilder: InstructionStepBuilderType) {
    this.stepBuilders.push(stepBuilder);
    return this;
  }

  public build(data: IInstructionsBuilderData): IInstructionListData {
    return {
      operatingSystem: this.os,
      steps: this.stepBuilders.map((stepBuilder) => stepBuilder(data)),
    };
  }
}
