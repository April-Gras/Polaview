<script lang="ts">
import { thumbnailifyTvDbImage } from "@/utils/thumbnailifyTvDbImage";
import { defineComponent, PropType } from "vue";

import { RouteLocationRaw } from "vue-router";

type PictureLoadStatus = "not loaded" | "failed" | "loaded" | "loading";

export default defineComponent({
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
  data() {
    return {
      pictureData: null as null | string,
      pictureLoadStatus: "not loaded" as PictureLoadStatus,
    };
  },
  mounted() {
    if (!this.pictureUrl) return;
    const observer = new IntersectionObserver((entries) => {
      if (this.pictureLoadStatus !== "not loaded") return;
      if (entries[0] && entries[0].isIntersecting) this.loadPicture();
    });

    observer.observe(this.$el);
  },
  methods: {
    loadPicture() {
      if (!this.pictureUrl) return;
      const image = new Image();
      this.pictureLoadStatus = "loading";

      image.attributes.setNamedItem;
      image.onerror = () => {
        this.pictureLoadStatus = "failed";
      };
      image.onload = () => {
        this.pictureData = image.src;
        this.pictureLoadStatus = "loaded";
      };
      image.src = thumbnailifyTvDbImage(this.pictureUrl);
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
        <Transition name="fade" mode="out-in">
          <img
            class="picture"
            :src="pictureData"
            key="done"
            rel="preload"
            loading="lazy"
            as="image"
            defer
            async
            :alt="pictureAlt"
            v-if="pictureUrl && pictureData && pictureLoadStatus === 'loaded'"
          />
          <!-- Additional div because of the 15s transition time -->
          <div
            v-else-if="
              ['loading', 'not loaded'].includes(pictureLoadStatus) &&
              pictureUrl
            "
            key="loading"
          >
            <div
              class="picture loadingPicture bg-gradient-to-b from-blue-500 via-gray-500 to-green-500"
            />
          </div>
          <div
            key="failed"
            class="picture flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-600"
            v-else
          >
            <span class="bold text-xl text-white">{{
              $t("common.pictureMissing")
            }}</span>
          </div>
        </Transition>
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
