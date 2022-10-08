<script lang="ts">
import { defineComponent } from "vue";
import { useUserStore } from "@/stores/user";

import { availableLocales } from "~/availableLocales";
import type { TranslateResult } from "vue-i18n";

type NavigationEntry = { route: string; text: TranslateResult; icon: string };

// @ts-ignore
import vClickOutside from "click-outside-vue3";

export default defineComponent({
  setup() {
    return {
      USER_STORE: useUserStore(),
    };
  },
  directives: {
    clickOutside: vClickOutside.directive,
  },
  data() {
    return {
      availableLocales,
      displayLangMenu: false,
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
    selectLang(lang: string): void {
      this.closeLangMenu();
      if (!this.$root?.$i18n.locale) return;
      this.$root.$i18n.locale = lang;
    },
    closeLangMenu(): void {
      this.displayLangMenu = false;
    },
    applyAppTheme(): void {
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
  <nav class="sticky top-0 z-50 w-full shadow-md">
    <div class="page-layout !py-4">
      <Transition name="fade" mode="out-in">
        <ul
          class="absolute top-20 right-0 grid w-full max-w-[128px] grid-cols-1 gap-2 rounded-sm bg-neutral-200 text-center shadow-lg dark:bg-gray-700"
          v-if="displayLangMenu"
          v-click-outside="closeLangMenu"
        >
          <h4 class="subtitle-text p-2">{{ $t("common.language") }}</h4>
          <hr class="mx-auto h-[2px] w-3/4 bg-neutral-400" />
          <li
            :key="lang"
            v-for="lang in availableLocales"
            class="base-text z-40 cursor-pointer px-4 py-1 transition-colors duration-150 ease-in-out hover:bg-neutral-300 hover:dark:bg-gray-600"
            @click="selectLang(lang)"
          >
            <!-- {{ $t('lang.eng') }} -->
            <!-- {{ $t('lang.fra') }} -->
            <!-- {{ $t('lang.deu') }} -->
            {{ $t(`lang.${lang}`) }}
          </li>
        </ul>
      </Transition>
      <div
        class="flex items-center justify-between space-x-6 overflow-auto text-center"
      >
        <div class="flex items-center justify-center space-x-6">
          <RouterLink
            v-for="entry in navigationEntries"
            :to="entry.route"
            class="flex cursor-pointer items-center justify-center space-x-3 rounded-sm bg-neutral-100 px-4 py-2 text-center shadow-sm transition duration-150 ease-in-out hover:bg-gray-300 hover:bg-opacity-25 hover:shadow-lg dark:bg-gray-800 hover:dark:bg-gray-900"
          >
            <span class="material-symbols-outlined overflow-hidden">{{
              entry.icon
            }}</span>
            <span class="font-bold">{{ entry.text }}</span>
          </RouterLink>
        </div>
        <div class="icons flex space-x-4">
          <button
            @click="
              appTheme = appTheme === 'dark' ? 'light' : 'dark';
              applyAppTheme();
            "
          >
            <span class="material-symbols-outlined">{{
              appTheme === "dark" ? "light_mode" : "dark_mode"
            }}</span>
          </button>
          <button
            v-if="USER_STORE.CURRENT_USER_IS_LOGGED_IN"
            @click="handleLogout"
          >
            <span class="material-symbols-outlined"> logout </span>
          </button>
          <button
            class="relative"
            @click.stop="displayLangMenu = !displayLangMenu"
          >
            <span class="material-symbols-outlined"> translate </span>
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<style lang="scss" scoped>
.icons > button {
  @apply flex items-center justify-center;
}
</style>
