import Vue from 'vue'
import App from './App.vue'
import router from './router'
import hasRole from './directives/has-role';
import { AuthService } from './services/auth.service';

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App),
  directives: {
    hasRole,
  },
  beforeMount: function () {
    window.vueLocation = this.$router;
  }
}).$mount('#app')

// Check for link sign-in
if (window.location.search.startsWith("?response=")) {
  const pl = window.location.search.substring(10);
  const data = JSON.parse(atob(pl)) as { token: string };
  AuthService.getInstance().applySession(data.token);
  window.location.href = '/index.html';
}