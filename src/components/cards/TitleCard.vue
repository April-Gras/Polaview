<script lang="ts">
import { defineComponent, PropType } from "vue";

import { Title } from "@prisma/client";

import CommonTemplateVue from "./CommonTemplate.vue";

export default defineComponent({
  components: {
    CommonTemplateVue,
  },
  props: {
    title: {
      type: Object as PropType<Title>,
      required: true,
    },
  },
});
</script>

<template>
  <CommonTemplateVue
    :link="`/title/${title.imdbId}`"
    :picture-url="title.pictureUrl"
  >
    <div class="base-text ellipsis p-4 !font-bold">{{ title.name }}</div>
  </CommonTemplateVue>
</template>
