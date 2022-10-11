<script lang="ts">
import { defineComponent, PropType } from "vue";

import VLazyPictureVue from "@/components/ui/VLazyPicture.vue";

import type { RouteLocationRaw } from "vue-router";

export default defineComponent({
  components: {
    VLazyPictureVue,
  },
  props: {
    link: {
      type: String as PropType<RouteLocationRaw>,
      required: true,
    },
    pictureUrl: {
      type: String as PropType<string | null | undefined>,
      required: false,
    },
    pictureAlt: {
      type: String,
      required: true,
    },
  },
});
</script>

<template>
  <li
    class="card relative w-full overflow-hidden rounded bg-gray-200 shadow-md transition duration-150 ease-in-out hover:scale-105 hover:shadow-xl dark:bg-neutral-800"
  >
    <RouterLink :to="link">
      <div class="relative overflow-hidden">
        <div
          class="sheen absolute top-0 left-0 h-1/3 w-full bg-white bg-opacity-10 transition-all duration-150 ease-in-out"
        />
        <VLazyPictureVue
          class="!h-80"
          :picture-alt="pictureAlt"
          :picture-url="pictureUrl"
        />
      </div>
      <slot />
    </RouterLink>
  </li>
</template>

<style scoped lang="scss">
.card {
  @apply w-full cursor-pointer;

  &:hover {
    a > div > .sheen {
      @apply bg-opacity-5;

      clip-path: polygon(0 0, 100% 0%, 100% 0%, 0 100%);
    }
  }
}

.sheen {
  clip-path: polygon(0 0, 100% 0%, 100% 25%, 0 100%);
}
</style>
