<script lang="ts">
import { defineComponent, PropType } from "vue";

export default defineComponent({
  props: {
    pictureUrl: {
      type: String as PropType<string | null | undefined>,
      required: false,
    },
    name: {
      type: String,
      required: false,
    },
    storyline: {
      type: String as PropType<string | null | undefined>,
      required: false,
    },
  },
});
</script>

<template>
  <li
    class="listContainer grid cursor-pointer items-center justify-start gap-4 bg-slate-300 px-6 py-4 transition duration-150 ease-in-out dark:bg-slate-600 hover:dark:bg-slate-500"
  >
    <img class="picture" v-if="pictureUrl" :src="pictureUrl" />
    <div class="picture" v-else />
    <b class="flex-shrink-0 text-base">{{ name }}</b>
    <i class="ellipsis text-opacity-80" v-if="storyline">{{ storyline }}</i>
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
