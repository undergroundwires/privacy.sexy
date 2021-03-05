import { IProjectInformation } from '@/domain/IProjectInformation';

export interface ICodeSubstituter {
    substitute(code: string, info: IProjectInformation): string;
}
