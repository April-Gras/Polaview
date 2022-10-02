<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({});
</script>

<template>
  <section class="grid grid-cols-1 gap-4">
    <h1 class="title-text">{{ $t("pages.error.title") }}</h1>
    <h2 class="subtitle-text">{{ $t("pages.error.subtitle") }}</h2>
    <p class="base-text">{{ $t("pages.error.text") }}</p>
  </section>
</template>
