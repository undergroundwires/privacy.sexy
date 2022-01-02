import Vue from 'vue';
import App from './components/App.vue';
import { ApplicationBootstrapper } from './bootstrapping/ApplicationBootstrapper';

new ApplicationBootstrapper()
  .bootstrap(Vue);

new Vue({
  render: (h) => h(App),
}).$mount('#app');
