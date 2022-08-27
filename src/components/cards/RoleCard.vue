<script lang="ts">
import { defineComponent, PropType } from "vue";

import type { Person, Role } from ".prisma/client";

import CommonTemplateVue from "./CommonTemplate.vue";

export default defineComponent({
  components: {
    CommonTemplateVue,
  },
  props: {
    role: {
      type: Object as PropType<Role>,
      required: true,
    },
    personCollection: {
      type: Array as PropType<Person[]>,
      required: true,
    },
  },
  computed: {
    person(): Person | undefined {
      return this.personCollection.find(
        ({ imdbId }) => imdbId === this.role.personImdbId
      );
    },
  },
});
</script>

<template>
  <CommonTemplateVue
    v-if="person"
    :link="`/person/${person.imdbId}`"
    :picture-url="role.pictureUrl"
    :picture-alt="role.name"
    class="person"
  >
    <ul class="p-4">
      <li class="base-text ellipsis !font-bold">{{ role.name }}</li>
      <i v-if="person">{{ person.name }}</i>
    </ul>
  </CommonTemplateVue>
</template>

<style scoped lang="scss">
.person:deep(.picture) {
  @apply h-52;
}
</style>
