import Vue from 'vue';
import Vuetify from 'vuetify';
import('vuetify/dist/vuetify.min.css');
import('material-design-icons-iconfont/dist/material-design-icons.css');
import('typeface-roboto/index.css');
const App = import('./App');
const router = import('./router');
const { store } = import('./store');

Vue.config.productionTip = false;

Vue.use(Vuetify);

new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
});
