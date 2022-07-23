<script lang="ts" setup>
defineEmits<{
  (e: "action", value: void): void;
}>();
</script>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({});
</script>
<template>
  <button
    @click="$emit('action')"
    @enter="$emit('action')"
    class="rounded-sm bg-sky-600 !bg-opacity-50 py-2 px-4 font-semibold text-white shadow transition duration-150 ease-in-out hover:!bg-opacity-75 hover:shadow-lg focus:!bg-opacity-100 dark:bg-sky-500"
  >
    <slot />
  </button>
</template>
