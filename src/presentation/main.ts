import { createApp } from 'vue';
import App from './components/App.vue';
import { ApplicationBootstrapper } from './bootstrapping/ApplicationBootstrapper';

const app = createApp(App);

await new ApplicationBootstrapper()
  .bootstrap(app);

app.mount('#app');
