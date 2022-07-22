<script lang="ts">
import { defineComponent } from "vue";
import { useUserStore } from "@/stores/user";

import NavigationVue from "./components/Navigation.vue";

const noMandatoryLoginRoutes = ["/login", "/logout"];

export default defineComponent({
  components: {
    NavigationVue,
  },
  setup() {
    return { USER_STORE: useUserStore() };
  },
  async created() {
    await this.USER_STORE.ATTEMPT_LOGIN();

    // Is logged in skip
    if (this.USER_STORE.id) return;

    console.log(this.$route.path);
    if (
      this.currentRouteRequiresLogin &&
      !this.USER_STORE.CURRENT_USER_IS_LOGGED_IN
    )
      this.$router.push("/login");
  },
  computed: {
    currentRouteRequiresLogin(): boolean {
      return !noMandatoryLoginRoutes.includes(this.$route.path);
    },
    canDisplayRouteComponent(): boolean {
      return (
        this.USER_STORE.CURRENT_USER_IS_LOGGED_IN ||
        !this.currentRouteRequiresLogin
      );
    },
  },
});
</script>

<template>
  <div>
    <nav class="page-layout text-center shadow">
      <NavigationVue />
    </nav>
    <div class="page-layout bg-red-500">
      <RouterView v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" v-if="canDisplayRouteComponent" />
        </transition>
      </RouterView>
    </div>
  </div>
</template>
