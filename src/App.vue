<script lang="ts">
import { defineComponent } from "vue";
import { useUserStore } from "@/stores/user";

import NavigationVue from "./components/Navigation.vue";
import FooterVue from "./components/Footer.vue";

const noMandatoryLoginRoutes = [
  "/login",
  "/logout",
  "/signup",
  "/signup/confirmed",
];

const adminRoutes = ["/admin"];

export default defineComponent({
  components: {
    NavigationVue,
    FooterVue,
  },
  setup() {
    return {
      USER_STORE: useUserStore(),
    };
  },
  async created() {
    try {
      await this.USER_STORE.ATTEMPT_LOGIN();
    } catch (_) {}

    if (
      (this.currentRouteRequiresLogin &&
        !this.USER_STORE.CURRENT_USER_IS_LOGGED_IN) ||
      (!this.USER_STORE.isAdmin && this.currentRouteRequiresAdmin)
    )
      this.$router.push(
        this.USER_STORE.CURRENT_USER_IS_LOGGED_IN ? "/" : "/login"
      );
  },
  computed: {
    currentRouteRequiresLogin(): boolean {
      return !noMandatoryLoginRoutes.includes(this.$route.path);
    },
    currentRouteRequiresAdmin(): boolean {
      return adminRoutes.includes(this.$route.path);
    },
    canDisplayRouteComponent(): boolean {
      if (this.USER_STORE.isAdmin) return true;
      return (
        (this.USER_STORE.CURRENT_USER_IS_LOGGED_IN &&
          !this.currentRouteRequiresAdmin) ||
        !this.currentRouteRequiresLogin
      );
    },
  },
});
</script>

<template>
  <div class="flex min-h-screen flex-col bg-neutral-100 dark:bg-gray-800">
    <NavigationVue class="bg-neutral-200 dark:bg-gray-700" />
    <div class="page-layout">
      <RouterView v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" v-if="canDisplayRouteComponent" />
        </transition>
      </RouterView>
    </div>
    <FooterVue />
  </div>
</template>
