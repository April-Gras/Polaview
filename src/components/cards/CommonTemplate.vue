<script lang="ts">
import { defineComponent, PropType } from "vue";

import { RouteLocationRaw } from "vue-router";

type PictureLoadStatus = "not loaded" | "failed" | "loaded";

export default defineComponent({
  props: {
    link: {
      type: String as PropType<RouteLocationRaw>,
      required: true,
    },
    pictureUrl: {
      type: String as PropType<string | null>,
      required: true,
    },
  },
  data() {
    return {
      pictureData: null as null | string,
      pictureLoadStatus: "not loaded" as PictureLoadStatus,
    };
  },
  created() {
    if (!this.pictureUrl) return;
    const image = new Image();

    image.onerror = () => {
      this.pictureLoadStatus = "failed";
    };
    image.onload = () => {
      this.pictureData = image.src;
      this.pictureLoadStatus = "loaded";
    };
    image.src = this.pictureUrl;
  },
});
</script>

<template>
  <li
    class="card relative w-full overflow-hidden rounded bg-slate-200 shadow-md transition duration-150 ease-in-out hover:scale-105 hover:shadow-xl dark:bg-neutral-800"
  >
    <RouterLink :to="link">
      <div class="relative overflow-hidden">
        <div
          class="sheen absolute top-0 left-0 h-1/3 w-full bg-white bg-opacity-10 transition-all duration-150 ease-in-out"
        />
        <img
          class="picture"
          :src="pictureData"
          v-if="pictureUrl && pictureData && pictureLoadStatus === 'loaded'"
        />
        <div
          class="picture loadingPicture bg-gradient-to-b from-blue-500 via-slate-500 to-green-500"
          v-else-if="pictureLoadStatus === 'not loaded'"
        />
        <div
          class="picture bg-gradient-to-br from-slate-200 to-slate-600"
          v-else
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

.picture {
  @apply h-80 w-full object-cover;
}

@keyframes gradient {
  0% {
    background-position: 0% 0%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 100%;
  }
}

.loadingPicture {
  background-size: 400% 400%;
  animation: gradient 15s ease infinite both alternate;
}
</style>
