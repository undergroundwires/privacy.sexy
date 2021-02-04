import { Component, Vue } from 'vue-property-decorator';
import { AsyncLazy } from '@/infrastructure/Threading/AsyncLazy';
import { IApplicationContext } from '@/application/Context/IApplicationContext';
import { buildContext } from '@/application/Context/ApplicationContextProvider';
import { IApplicationContextChangedEvent } from '@/application/Context/IApplicationContext';
import { IApplication } from '@/domain/IApplication';
import { ICategoryCollectionState } from '@/application/Context/State/ICategoryCollectionState';
import { EventSubscriptionCollection } from '../infrastructure/Events/EventSubscriptionCollection';

// @ts-ignore because https://github.com/vuejs/vue-class-component/issues/91
@Component
export abstract class StatefulVue extends Vue {
    public static instance = new AsyncLazy<IApplicationContext>(
        () => Promise.resolve(buildContext()));

    protected readonly events = new EventSubscriptionCollection();

    private readonly ownEvents = new EventSubscriptionCollection();

    public async mounted() {
        const context = await this.getCurrentContextAsync();
        this.ownEvents.register(context.contextChanged.on((event) => this.handleStateChangedEvent(event)));
        this.initialize(context.app);
        this.handleCollectionState(context.state, undefined);
    }
    public destroyed() {
        this.ownEvents.unsubscribeAll();
        this.events.unsubscribeAll();
    }

    protected abstract initialize(app: IApplication): void;
    protected abstract handleCollectionState(
        newState: ICategoryCollectionState, oldState: ICategoryCollectionState | undefined): void;
    protected getCurrentContextAsync(): Promise<IApplicationContext> {
        return StatefulVue.instance.getValueAsync();
    }

    private handleStateChangedEvent(event: IApplicationContextChangedEvent) {
        this.handleCollectionState(event.newState, event.oldState);
    }
}
