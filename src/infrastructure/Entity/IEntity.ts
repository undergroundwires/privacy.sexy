/** Aggregate root */
export interface IEntity<TId> {
  id: TId;
  equals(other: TId): boolean;
}
