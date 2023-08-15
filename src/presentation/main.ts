import Vue from 'vue';
import { buildContext } from '@/application/Context/ApplicationContextFactory';
import App from './components/App.vue';
import { ApplicationBootstrapper } from './bootstrapping/ApplicationBootstrapper';

buildContext().then(() => {
  // hack workaround to solve running tests through
  // Vue CLI throws 'Top-level-await is only supported in EcmaScript Modules'
  // once migrated to vite, remove buildContext() call from here and use top-level-await
  new ApplicationBootstrapper()
    .bootstrap(Vue);

  new Vue({
    render: (h) => h(App),
  }).$mount('#app');
});
