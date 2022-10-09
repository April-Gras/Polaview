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
      path: "/watch/movie/:id",
      name: "movieById",
      component: () => import("@/views/WatchById.vue"),
    },
    {
      path: "/watch/episode/:id",
      name: "episodeById",
      component: () => import("@/views/WatchById.vue"),
    },
    {
      path: "/serie/:id",
      name: "serieById",
      component: () => import("@/views/SerieById.vue"),
    },
    {
      path: "/people/:id",
      name: "peopleById",
      component: () => import("@/views/PeopleById.vue"),
    },
    {
      path: "/error",
      name: "error",
      component: () => import("@/views/Error.vue"),
    },
    {
      path: "/about",
      name: "about",
      component: () => import("@/views/About.vue"),
    },
    {
      path: "/requests",
      name: "requests",
      component: () => import("@/views/ResquestAddtion.vue"),
    },
  ],
});
