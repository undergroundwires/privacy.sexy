import { Component, Vue } from 'vue-property-decorator';
import { AsyncLazy } from '@/infrastructure/Threading/AsyncLazy';
import { IApplicationContext, IApplicationContextChangedEvent } from '@/application/Context/IApplicationContext';
import { buildContext } from '@/application/Context/ApplicationContextFactory';
import { IReadOnlyCategoryCollectionState } from '@/application/Context/State/ICategoryCollectionState';
import { EventSubscriptionCollection } from '@/infrastructure/Events/EventSubscriptionCollection';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore because https://github.com/vuejs/vue-class-component/issues/91
@Component
export abstract class StatefulVue extends Vue {
  private static readonly instance = new AsyncLazy<IApplicationContext>(() => buildContext());

  protected readonly events = new EventSubscriptionCollection();

  private readonly ownEvents = new EventSubscriptionCollection();

  public async mounted() {
    const context = await this.getCurrentContext();
    this.ownEvents.register(
      context.contextChanged.on((event) => this.handleStateChangedEvent(event)),
    );
    this.handleCollectionState(context.state, undefined);
  }

  protected abstract handleCollectionState(
    newState: IReadOnlyCategoryCollectionState,
    oldState: IReadOnlyCategoryCollectionState | undefined): void;

  protected getCurrentContext(): Promise<IApplicationContext> {
    return StatefulVue.instance.getValue();
  }

  private handleStateChangedEvent(event: IApplicationContextChangedEvent) {
    this.handleCollectionState(event.newState, event.oldState);
  }
}
