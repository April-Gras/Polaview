import { createRouter, createWebHistory } from "vue-router";

import Login from "@/views/Login.vue";
import Root from "@/views/Root.vue";

export const routerPlugin = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "root",
      component: Root,
    },
    {
      path: "/login",
      name: "login",
      component: Login,
    },
  ],
});
