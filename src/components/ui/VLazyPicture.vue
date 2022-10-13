<script lang="ts">
import { defineComponent } from "vue";

import { thumbnailifyTvDbImage } from "@/utils/thumbnailifyTvDbImage";

import type { PropType } from "vue";

type PictureLoadStatus = "not loaded" | "failed" | "loaded" | "loading";

export default defineComponent({
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
  <Transition
    name="fade"
    mode="out-in"
    tag="div"
    class="relative h-full w-full"
  >
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
        ['loading', 'not loaded'].includes(pictureLoadStatus) && pictureUrl
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
</template>

<style lang="scss" scoped>
.picture {
  @apply h-full w-full object-cover object-center;
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
