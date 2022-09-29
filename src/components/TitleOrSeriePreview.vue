<script lang="ts">
import { defineComponent, PropType } from "vue";

export default defineComponent({
  props: {
    image: {
      type: String as PropType<string | null | undefined>,
      required: false,
    },
    name: {
      type: String,
      required: false,
    },
    overview: {
      type: String as PropType<string | null | undefined>,
      required: false,
    },
  },
});
</script>

<template>
  <li
    class="listContainer grid cursor-pointer items-center justify-start gap-4 bg-gray-300 px-6 py-4 transition duration-150 ease-in-out dark:bg-gray-600 hover:dark:bg-gray-500"
  >
    <img class="picture" v-if="image" :src="image" />
    <div class="picture" v-else />
    <b class="base-text flex-shrink-0">{{ name }}</b>
    <i class="ellipsis text-opacity-80" v-if="overview">{{ overview }}</i>
  </li>
</template>

<style scoped lang="scss">
.listContainer {
  grid-template-columns: theme("space.16") auto auto;
}

.picture {
  @apply h-16 w-16 rounded-md object-cover object-center;
}
</style>
