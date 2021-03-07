import { VueConstructor } from 'vue';

export interface IVueBootstrapper {
    bootstrap(vue: VueConstructor): void;
}

export { VueConstructor };
