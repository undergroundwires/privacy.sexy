export class Version {
  public readonly major: number;

  public readonly minor: number;

  public readonly patch: number;

  public constructor(semanticVersion: string) {
    if (!semanticVersion) {
      throw new Error('empty version');
    }
    if (!semanticVersion.match(/^\d+\.\d+\.\d+$/g)) {
      throw new Error(`invalid version: ${semanticVersion}`);
    }
    const [major, minor, patch] = semanticVersion.split('.');
    this.major = parseInt(major, 10);
    this.minor = parseInt(minor, 10);
    this.patch = parseInt(patch, 10);
  }

  public toString(): string {
    return `${this.major}.${this.minor}.${this.patch}`;
  }
}
