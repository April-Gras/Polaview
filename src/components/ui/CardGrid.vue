<script lang="ts">
import { defineComponent } from "vue";

import HeightExpandVue from "../transitions/HeightExpand.vue";

export default defineComponent({
  components: {
    HeightExpandVue,
  },
});
</script>

<template>
  <article class="grid grid-cols-1 gap-6">
    <h2 class="subtitle-text">
      <slot name="title" />
    </h2>
    <HeightExpandVue>
      <ul
        v-if="$slots['list']"
        class="grid grid-cols-1 gap-x-2 gap-y-6 xs:grid-cols-2 sm:grid-cols-3 md:gap-6 xl:grid-cols-4"
      >
        <slot name="list" />
      </ul>
    </HeightExpandVue>
  </article>
</template>
