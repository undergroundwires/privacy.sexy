import { ApplicationState } from '@/application/State/ApplicationState';
import { IApplicationState } from '@/application/State/IApplicationState';
import { Vue } from 'vue-property-decorator';

export abstract class StatefulVue extends Vue {
    public isLoading = true;

    protected getCurrentStateAsync(): Promise<IApplicationState> {
        return ApplicationState.GetAsync();
    }
}
