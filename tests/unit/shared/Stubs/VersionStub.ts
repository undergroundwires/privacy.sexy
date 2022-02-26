import { Version } from '@/domain/Version';

export class VersionStub extends Version {
  constructor(version?: string) {
    super(version ?? '0.10.0');
  }
}
