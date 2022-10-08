<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({});
</script>

<template>
  <div
    class="base-text rounded border border-solid border-gray-400 bg-gray-300 px-4 py-1 !text-sm shadow dark:border-slate-700 dark:bg-slate-900"
  >
    <slot />
  </div>
</template>
