import { Component, Vue } from 'vue-property-decorator';
import { AsyncLazy } from '@/infrastructure/Threading/AsyncLazy';
import { IApplicationContext } from '@/application/Context/IApplicationContext';
import { buildContext } from '@/application/Context/ApplicationContextFactory';
import { IApplicationContextChangedEvent } from '@/application/Context/IApplicationContext';
import { ICategoryCollectionState } from '@/application/Context/State/ICategoryCollectionState';
import { EventSubscriptionCollection } from '@/infrastructure/Events/EventSubscriptionCollection';

// @ts-ignore because https://github.com/vuejs/vue-class-component/issues/91
@Component
export abstract class StatefulVue extends Vue {
    private static readonly instance = new AsyncLazy<IApplicationContext>(() => buildContext());

    protected readonly events = new EventSubscriptionCollection();

    private readonly ownEvents = new EventSubscriptionCollection();

    public async mounted() {
        const context = await this.getCurrentContext();
        this.ownEvents.register(context.contextChanged.on((event) => this.handleStateChangedEvent(event)));
        this.handleCollectionState(context.state, undefined);
    }
    public destroyed() {
        this.ownEvents.unsubscribeAll();
        this.events.unsubscribeAll();
    }

    protected abstract handleCollectionState(
        newState: ICategoryCollectionState, oldState: ICategoryCollectionState | undefined): void;
    protected getCurrentContext(): Promise<IApplicationContext> {
        return StatefulVue.instance.getValue();
    }

    private handleStateChangedEvent(event: IApplicationContextChangedEvent) {
        this.handleCollectionState(event.newState, event.oldState);
    }
}
