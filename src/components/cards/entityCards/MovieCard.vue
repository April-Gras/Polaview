<script lang="ts">
import { defineComponent, PropType } from "vue";

import { Movie } from "@prisma/client";

import CommonTemplateVue from "./CommonTemplate.vue";

export default defineComponent({
  components: {
    CommonTemplateVue,
  },
  props: {
    movie: {
      type: Object as PropType<Movie>,
      required: true,
    },
  },
});
</script>

<template>
  <CommonTemplateVue
    :link="`/watch/movie/${movie.id}`"
    :picture-url="movie.image"
    :picture-alt="movie.name"
  >
    <div class="base-text ellipsis p-4 !font-bold">{{ movie.name }}</div>
  </CommonTemplateVue>
</template>
