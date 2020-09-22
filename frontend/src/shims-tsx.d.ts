import Vue, { VNode } from 'vue';
import VueRouter, { Route } from 'vue-router';

declare global {
  namespace JSX {
    // tslint:disable no-empty-interface
    interface Element extends VNode {}
    // tslint:disable no-empty-interface
    interface ElementClass extends Vue {}
    interface IntrinsicElements {
      [elem: string]: any
    }
  }

  interface Window {
    vueLocation: VueRouter;
  }
}

declare module 'vue/types/vue' {
  interface Vue {
    $router: VueRouter
  }
}