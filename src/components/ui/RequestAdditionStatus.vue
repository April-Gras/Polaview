<script lang="ts">
import { defineComponent } from "vue";

import type { PropType } from "vue";
import type { EntityAddtionRequestSummary } from "~/types/RouteLibraryDataLayer";

export default defineComponent({
  props: {
    request: {
      type: Object as PropType<EntityAddtionRequestSummary>,
      required: true,
    },
  },
});
</script>

<template>
  <div class="baseElemenent flex w-full items-center gap-2">
    <div
      :class="`bg-request-addition-${request.status.toLowerCase()}`"
      class="statusIcon h-4 w-4 max-w-[theme('space.10')] rounded-full transition-all duration-150 ease-in-out"
    />
    <span
      class="inline-block pt-[2px] text-xs font-bold uppercase text-gray-600 dark:text-gray-300"
    >
      {{ $t(`entityRequest.status.${request.status}`) }}
    </span>
  </div>
</template>

<style scoped lang="scss">
.baseElemenent:hover {
  .statusIcon {
    @apply w-10;
  }
}
</style>
