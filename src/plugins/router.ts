import { createRouter, createWebHistory } from "vue-router";

export const routerPlugin = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "root",
      component: () => import("@/views/Root.vue"),
    },
    {
      path: "/login",
      name: "login",
      component: () => import("@/views/Login.vue"),
    },
    {
      path: "/signup",
      name: "signup",
      component: () => import("@/views/Signup.vue"),
    },
    {
      path: "/signup/confirmed",
      name: "signupConfirmed",
      component: () => import("@/views/SignupConfirmed.vue"),
    },
    {
      path: "/admin",
      name: "admin",
      component: () => import("@/views/Admin.vue"),
    },
    {
      path: "/title/:imdbId",
      name: "titleByImdbId",
      component: () => import("@/views/TitleByImdbId.vue"),
    },
    {
      path: "/serie/:imdbId",
      name: "serieByImdbId",
      component: () => import("@/views/SerieByImdbId.vue"),
    },
    {
      path: "/person/:imdbId",
      name: "personByImdbId",
      component: () => import("@/views/PersonByImdbId.vue"),
    },
  ],
});
