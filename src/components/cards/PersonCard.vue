<script lang="ts">
import { defineComponent, PropType } from "vue";

import type { Person } from "@prisma/client";

import CommonTemplateVue from "./CommonTemplate.vue";

export default defineComponent({
  components: {
    CommonTemplateVue,
  },
  props: {
    person: {
      type: Object as PropType<Person>,
      required: true,
    },
  },
});
</script>

<template>
  <CommonTemplateVue
    :link="`/person/${person.imdbId}`"
    :picture-url="person.pictureUrl"
  >
    <ul class="p-4">
      <li class="base-text ellipsis !font-bold">{{ person.name }}</li>
    </ul>
  </CommonTemplateVue>
</template>
