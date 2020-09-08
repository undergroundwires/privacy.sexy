import { Vue } from 'vue-property-decorator';
import { AsyncLazy } from '@/infrastructure/Threading/AsyncLazy';
import { IApplicationContext } from '@/application/State/IApplicationContext';
import { buildContext } from '@/application/State/ApplicationContextProvider';

export abstract class StatefulVue extends Vue {
    private static instance = new AsyncLazy<IApplicationContext>(
        () => Promise.resolve(buildContext()));

    protected getCurrentContextAsync(): Promise<IApplicationContext> {
        return StatefulVue.instance.getValueAsync();
    }
}
