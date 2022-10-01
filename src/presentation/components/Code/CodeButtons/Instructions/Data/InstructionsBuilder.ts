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
    if (!stepBuilder) { throw new Error('missing stepBuilder'); }
    this.stepBuilders.push(stepBuilder);
    return this;
  }

  public build(data: IInstructionsBuilderData): IInstructionListData {
    if (!data) { throw new Error('missing data'); }
    return {
      operatingSystem: this.os,
      steps: this.stepBuilders.map((stepBuilder) => stepBuilder(data)),
    };
  }
}
