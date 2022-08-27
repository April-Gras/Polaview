<script lang="ts">
import { defineComponent } from "vue";

import CardGridVue from "./CardGrid.vue";

export default defineComponent({
  components: {
    CardGridVue,
  },
  data() {
    return {
      expanded: false,
    };
  },
});
</script>

<template>
  <CardGridVue>
    <template #title>
      <div
        @click="expanded = !expanded"
        class="flex cursor-pointer items-center justify-start gap-4"
      >
        <Transition name="fade" mode="out-in">
          <span v-if="!expanded" class="material-symbols-outlined text-3xl">
            expand_more
          </span>
          <span v-else class="material-symbols-outlined text-3xl">
            expand_less
          </span>
        </Transition>
        <slot name="title" />
      </div>
    </template>
    <template #list v-if="expanded">
      <slot name="list" />
    </template>
  </CardGridVue>
</template>
