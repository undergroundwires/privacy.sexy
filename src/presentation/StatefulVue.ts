import { ApplicationState, IApplicationState } from '../application/State/ApplicationState';
import { Vue } from 'vue-property-decorator';
export { IApplicationState };

export abstract class StatefulVue extends Vue {
    public isLoading = true;

    protected getCurrentStateAsync(): Promise<IApplicationState> {
        return ApplicationState.GetAsync();
    }
}
