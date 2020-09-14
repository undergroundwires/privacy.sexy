import Vue from 'vue';
import App from './App.vue';
import { ApplicationBootstrapper } from './presentation/Bootstrapping/ApplicationBootstrapper';
import 'core-js/fn/array/flat-map'; // Here until Vue 3 & CLI v4 https://github.com/vuejs/vue-cli/issues/3834

new ApplicationBootstrapper()
    .bootstrap(Vue);

new Vue({
    render: (h) => h(App),
}).$mount('#app');
