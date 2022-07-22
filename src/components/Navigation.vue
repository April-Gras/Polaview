<script lang="ts">
import { defineComponent } from "vue";
import { useUserStore } from "@/stores/user";

export default defineComponent({
  setup: () => ({
    USER_STORE: useUserStore(),
  }),
  data() {
    return {};
  },
});
</script>

<template>
  <nav class="w-full"></nav>
</template>
