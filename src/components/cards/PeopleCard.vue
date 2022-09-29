<script lang="ts">
import { defineComponent, PropType } from "vue";

import type { People } from "@prisma/client";

import CommonTemplateVue from "./CommonTemplate.vue";

export default defineComponent({
  components: {
    CommonTemplateVue,
  },
  props: {
    people: {
      type: Object as PropType<People>,
      required: true,
    },
  },
});
</script>

<template>
  <CommonTemplateVue
    :link="`/people/${people.id}`"
    :picture-url="people.image"
    :picture-alt="people.name"
    class="people"
  >
    <ul class="p-4">
      <li class="base-text ellipsis !font-bold">{{ people.name }}</li>
    </ul>
  </CommonTemplateVue>
</template>

<style scoped lang="scss">
.people:deep(.picture) {
  @apply h-52;
}
</style>
