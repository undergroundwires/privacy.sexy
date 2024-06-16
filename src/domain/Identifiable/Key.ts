export interface Key {
  equals(otherKey: this): boolean;
  createSerializedKey(): string;
}
