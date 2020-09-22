import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue';
import UserAdmin from '../views/UserAdmin.vue';
import EmplyoeeView from '../views/EmployeeView.vue';
import { AuthService } from '@/services/auth.service';
import { createLogger } from '@/services/logger.service';
import AdminView from '../views/AdminView.vue';

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
  },
  {
    path: '/',
    name: 'Home',
    component: Home,
    children: [
      {
        path: 'employee-view',
        name: 'EmployeeView',
        component: EmplyoeeView
      },
      {
        path: 'admin',
        component: AdminView,
        children: [
          {
            path: 'user',
            name: 'UserAdmin',
            component: UserAdmin
          },
          { path: '/admin*', redirect: '/admin/user' }
        ],
      },
      { path: '*', redirect: 'employee-view' }
    ]
  }
];

const router = new VueRouter({
  routes
});

const logger = createLogger(`VueRouter`);

router.beforeEach((to, from, next) => {
  logger.debug(`NAV: ${from.name} (${from.path}) --> ${to.name} (${to.path})`);

  if (to.name !== 'Login') {
    if (!AuthService.getInstance().isSignedIn()) {
      next({ name: 'Login' });
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;
