<script lang="ts">
import { defineComponent, PropType } from "vue";

import type { SerieSummary } from "~/types/RouteLibraryScrapImdb";

import CommonTemplateVue from "./CommonTemplate.vue";

export default defineComponent({
  components: {
    CommonTemplateVue,
  },
  props: {
    serieSummary: {
      type: Object as PropType<SerieSummary>,
      required: true,
    },
  },
});
</script>

<template>
  <CommonTemplateVue
    :link="`/serie/${serieSummary.imdbId}`"
    :picture-url="serieSummary.pictureUrl"
  >
    <div class="base-text ellipsis p-4 !font-bold">{{ serieSummary.name }}</div>
  </CommonTemplateVue>
</template>
