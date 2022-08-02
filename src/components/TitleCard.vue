<script lang="ts">
import { defineComponent, PropType } from "vue";

import { Title } from "@prisma/client";

export default defineComponent({
  props: {
    title: {
      type: Object as PropType<Title>,
      required: true,
    },
  },
});
</script>

<template>
  <li
    class="titleCard relative w-full overflow-hidden rounded bg-slate-200 shadow-md transition duration-150 ease-in-out hover:scale-105 hover:shadow-xl dark:bg-neutral-800"
  >
    <RouterLink :to="`/title/${title.imdbId}`">
      <div class="relative overflow-hidden">
        <div
          class="sheen absolute top-0 left-0 h-1/3 w-full bg-white bg-opacity-10 transition-all duration-150 ease-in-out"
        />
        <img
          class="titlePicture"
          :src="title.pictureUrl"
          v-if="title.pictureUrl"
        />
        <div
          class="titlePicture bg-gradient-to-br from-slate-200 to-slate-600"
          v-else
        />
      </div>
      <div class="base-text ellipsis p-4 !font-bold">{{ title.name }}</div>
    </RouterLink>
  </li>
</template>

<style scoped lang="scss">
.titleCard {
  @apply w-full cursor-pointer;

  &:hover {
    > div > .sheen {
      @apply bg-opacity-5;

      clip-path: polygon(0 0, 100% 0%, 100% 0%, 0 100%);
    }
  }
}

.sheen {
  clip-path: polygon(0 0, 100% 0%, 100% 25%, 0 100%);
}

.titlePicture {
  @apply max-h-80 w-full object-cover;
}
</style>
