<script lang="ts">
import { defineComponent } from "vue";

import VButtonMainVue from "@/components/ui/VButtonMain.vue";

import type { RouteLocationRaw } from "vue-router";
import type { PropType } from "vue";

export default defineComponent({
  components: {
    VButtonMainVue,
  },
  props: {
    materialIcon: {
      required: true,
      type: String,
    },
    materialIconClass: {
      type: String,
      required: false,
      default: "material-symbols-outlined",
    },
    to: {
      type: [String, Object] as PropType<RouteLocationRaw>,
      required: true,
    },
  },
  computed: {
    routeIsSelected(): boolean {
      return this.to === this.$route.path;
    },
  },
});
</script>

<template>
  <RouterLink
    :to="to"
    class="relative w-full space-y-4 overflow-hidden rounded bg-gradient-to-br from-blue-300 to-blue-400 shadow-md saturate-50 transition duration-150 ease-in-out hover:shadow-2xl dark:from-cyan-800 dark:to-cyan-900"
    :class="{ routeIsSelected }"
  >
    <div class="flex h-24 w-full items-center justify-center p-4">
      <span
        :class="materialIconClass"
        class="bold icon transform text-3xl text-white opacity-50 transition duration-150 ease-in-out"
      >
        {{ materialIcon }}
      </span>
    </div>
    <VButtonMainVue class="w-full self-end">
      <template #default>
        <slot />
      </template>
    </VButtonMainVue>
  </RouterLink>
</template>

<style scoped lang="scss">
.routeIsSelected {
  @apply saturate-100;

  .icon {
    @apply scale-150 opacity-100;
  }
}
</style>
