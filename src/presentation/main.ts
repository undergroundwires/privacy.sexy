import Vue from 'vue';
import { buildContext } from '@/application/Context/ApplicationContextFactory';
import App from './components/App.vue';
import { ApplicationBootstrapper } from './bootstrapping/ApplicationBootstrapper';

let vue: Vue;

buildContext().then(() => {
  // hack workaround to solve running tests through
  // Vue CLI throws 'Top-level-await is only supported in EcmaScript Modules'
  // once migrated to vite, remove buildContext() call from here and use top-level-await
  new ApplicationBootstrapper()
    .bootstrap(Vue);

  vue = new Vue({
    render: (h) => h(App),
  }).$mount('#app');
});

export const getVue = () => vue; // exporting is hack until Vue 3 so vue-js-modal can be used
