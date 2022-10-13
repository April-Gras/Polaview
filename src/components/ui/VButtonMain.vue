<script lang="ts" setup>
defineEmits<{
  (e: "action", value: void): void;
}>();
</script>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    disabled: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
});
</script>
<template>
  <button
    @click="!disabled && $emit('action')"
    @enter="!disabled && $emit('action')"
    :class="{ disabled }"
    class="mainButton rounded-sm bg-sky-600 !bg-opacity-50 py-2 px-4 font-semibold text-white shadow transition duration-150 ease-in-out hover:!bg-opacity-75 hover:shadow-lg focus:!bg-opacity-100 dark:bg-sky-500"
  >
    <slot />
  </button>
</template>

<style lang="scss">
.mainButton {
  &.disabled {
    @apply pointer-events-none opacity-50;
  }
}
</style>
