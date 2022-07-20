import { createRouter, createWebHistory } from "vue-router";

import Root from "@/views/Root.vue";

export const routerPlugin = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "root",
      component: Root,
    },
  ],
});
