import { IUserSelection } from '@/application/Context/State/Selection/IUserSelection';
import { SelectedScript } from '@/application/Context/State/Selection/SelectedScript';
import { IScript } from '@/domain/IScript';
import { IEventSource } from '@/infrastructure/Events/IEventSource';
import { EventSource } from '@/infrastructure/Events/EventSource';

export class UserSelectionStub implements IUserSelection {
  public readonly changed: IEventSource<readonly SelectedScript[]> =
    new EventSource<readonly SelectedScript[]>();

  public selectedScripts: readonly SelectedScript[] = [];

  constructor(private readonly allScripts: readonly IScript[]) {

  }

  public withSelectedScripts(selectedScripts: readonly SelectedScript[]) {
    this.selectedScripts = selectedScripts;
  }

  public areAllSelected(): boolean {
    throw new Error('Method not implemented.');
  }

  public isAnySelected(): boolean {
    throw new Error('Method not implemented.');
  }

  public removeAllInCategory(): void {
    throw new Error('Method not implemented.');
  }

  public addOrUpdateAllInCategory(): void {
    throw new Error('Method not implemented.');
  }

  public addSelectedScript(): void {
    throw new Error('Method not implemented.');
  }

  public addOrUpdateSelectedScript(): void {
    throw new Error('Method not implemented.');
  }

  public removeSelectedScript(): void {
    throw new Error('Method not implemented.');
  }

  public selectOnly(scripts: ReadonlyArray<IScript>): void {
    this.selectedScripts = scripts.map((s) => new SelectedScript(s, false));
  }

  public isSelected(): boolean {
    throw new Error('Method not implemented.');
  }

  public selectAll(): void {
    this.selectOnly(this.allScripts);
  }

  public deselectAll(): void {
    this.selectedScripts = [];
  }
}
