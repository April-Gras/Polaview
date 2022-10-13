<script lang="ts">
import { defineComponent } from "vue";

import VLazyPictureVue from "@/components/ui/VLazyPicture.vue";

import type { PropType } from "vue";

export default defineComponent({
  components: {
    VLazyPictureVue,
  },
  props: {
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
    class="flex gap-4 overflow-hidden rounded bg-gray-200 shadow dark:bg-slate-700"
  >
    <div class="relative h-40 w-32 flex-shrink-0">
      <VLazyPictureVue :picture-url="pictureUrl" :picture-alt="pictureAlt" />
    </div>
    <slot />
  </li>
</template>
