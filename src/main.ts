import Vue from 'vue';
import App from './App.vue';
import { ApplicationBootstrapper } from './presentation/Bootstrapping/ApplicationBootstrapper';

new ApplicationBootstrapper()
    .bootstrap(Vue);

new Vue({
    render: (h) => h(App),
}).$mount('#app');
