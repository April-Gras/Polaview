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
    class="person"
  >
    <ul class="p-4">
      <li class="base-text ellipsis !font-bold">{{ person.name }}</li>
    </ul>
  </CommonTemplateVue>
</template>

<style scoped lang="scss">
.person:deep(.picture) {
  @apply h-52;
}
</style>
