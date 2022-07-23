<script lang="ts">
import { defineComponent } from "vue";
import { useUserStore } from "@/stores/user";

import { TranslateResult } from "vue-i18n";

type NavigationEntry = { route: string; text: TranslateResult; icon: string };

export default defineComponent({
  setup() {
    return {
      USER_STORE: useUserStore(),
    };
  },
  data() {
    return {
      appTheme:
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
          ? ("dark" as const)
          : ("light" as const),
    };
  },
  created() {
    this.applyAppTheme();
  },
  computed: {
    navigationEntries(): NavigationEntry[] {
      if (!this.USER_STORE.CURRENT_USER_IS_LOGGED_IN)
        return [
          {
            route: "/login",
            text: this.$t("navigation.login"),
            icon: "login",
          },
          {
            route: "/signup",
            text: this.$t("navigation.signup"),
            icon: "person_add",
          },
        ];
      else
        return [
          {
            route: "/",
            text: this.$t("navigation.root"),
            icon: "home",
          },
          ...(this.USER_STORE.isAdmin
            ? [
                {
                  route: "/admin",
                  text: this.$t("navigation.admin"),
                  icon: "admin_panel_settings",
                },
              ]
            : []),
        ];
    },
  },
  methods: {
    applyAppTheme() {
      const elem = document.getElementsByTagName("html");

      if (!elem || !elem[0]) return;
      elem[0].classList[this.appTheme === "light" ? "remove" : "add"]("dark");
    },
    handleLogout() {
      this.USER_STORE.LOGOUT();
      this.$router.push("/login");
    },
  },
});
</script>

<template>
  <nav class="w-full overflow-auto shadow-md">
    <div
      class="page-layout flex items-center justify-between space-x-6 !py-4 text-center"
    >
      <div class="flex items-center justify-center space-x-6">
        <RouterLink
          v-for="entry in navigationEntries"
          :to="entry.route"
          class="flex cursor-pointer items-center justify-center space-x-3 rounded-sm bg-neutral-100 px-4 py-2 text-center shadow-sm transition duration-150 ease-in-out hover:bg-slate-300 hover:bg-opacity-25 hover:shadow-lg dark:bg-slate-800 hover:dark:bg-slate-900"
        >
          <span class="material-symbols-outlined overflow-hidden">{{
            entry.icon
          }}</span>
          <span class="font-bold">{{ entry.text }}</span>
        </RouterLink>
      </div>
      <div class="flex space-x-4">
        <button
          @click="
            appTheme = appTheme === 'dark' ? 'light' : 'dark';
            applyAppTheme();
          "
          class="flex items-center justify-center"
        >
          <span class="material-symbols-outlined">{{
            appTheme === "dark" ? "light_mode" : "dark_mode"
          }}</span>
        </button>
        <button
          v-if="USER_STORE.CURRENT_USER_IS_LOGGED_IN"
          @click="handleLogout"
          class="flex items-center justify-center"
        >
          <span class="material-symbols-outlined"> logout </span>
        </button>
      </div>
    </div>
  </nav>
</template>
