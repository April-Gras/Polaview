<script lang="ts">
import { defineComponent, PropType } from "vue";

import type { SerieSummary } from "~/types/RouteLibraryDataLayer";

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
    :link="`/serie/${serieSummary.id}`"
    :picture-url="serieSummary.image"
    :picture-alt="serieSummary.name"
  >
    <ul class="p-4">
      <li class="base-text ellipsis !font-bold">{{ serieSummary.name }}</li>
      <li class="base-text italic">
        {{ $tc("common.season", serieSummary._count.seasons) }}
      </li>
    </ul>
  </CommonTemplateVue>
</template>
