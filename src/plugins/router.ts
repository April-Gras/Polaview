import { createRouter, createWebHistory } from "vue-router";

import Login from "@/views/Login.vue";
import Root from "@/views/Root.vue";
import Signup from "@/views/Signup.vue";
import SignupConfirmed from "@/views/SignupConfirmed.vue";
import Admin from "@/views/Admin.vue";
import TitleByImdbId from "@/views/TitleByImdbId.vue";

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
    {
      path: "/signup",
      name: "signup",
      component: Signup,
    },
    {
      path: "/signup/confirmed",
      name: "signupConfirmed",
      component: SignupConfirmed,
    },
    {
      path: "/admin",
      name: "admin",
      component: Admin,
    },
    {
      path: "/title/:imdbId",
      name: "titleByImdbId",
      component: TitleByImdbId,
    },
  ],
});
