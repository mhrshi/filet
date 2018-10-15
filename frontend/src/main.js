import Vue from 'vue';
import Vuetify from 'vuetify';
import 'vuetify/dist/vuetify.min.css';
import 'material-design-icons-iconfont/dist/material-design-icons.css';
import 'typeface-roboto/index.css';
import 'typeface-roboto-mono/index.css';
import App from './App';
import router from './router';
import { store } from './store';

Vue.config.productionTip = false;

Vue.use(Vuetify);

new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
});
