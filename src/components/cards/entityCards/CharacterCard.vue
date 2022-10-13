<script lang="ts">
import { defineComponent, PropType } from "vue";

import type { People, Character } from ".prisma/client";

import CommonTemplateVue from "./CommonTemplate.vue";

export default defineComponent({
  components: {
    CommonTemplateVue,
  },
  props: {
    character: {
      type: Object as PropType<Character>,
      required: true,
    },
    peopleCollection: {
      type: Array as PropType<People[]>,
      required: true,
    },
  },
  computed: {
    people(): People | undefined {
      return this.peopleCollection.find(
        ({ id }) => id === this.character.peopleId
      );
    },
  },
});
</script>

<template>
  <CommonTemplateVue
    v-if="people"
    :link="`/people/${people.id}`"
    :picture-url="
      character.image ? `https://artworks.thetvdb.com${character.image}` : null
    "
    :picture-alt="character.name"
    class="people"
  >
    <ul class="p-4">
      <li class="base-text ellipsis !font-bold">{{ character.name }}</li>
      <i v-if="people">{{ people.name }}</i>
    </ul>
  </CommonTemplateVue>
</template>
