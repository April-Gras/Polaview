<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({});
</script>

<template>
  <div class="grid grid-cols-1 gap-6">
    <h1 class="title-text">{{ $t("pages.signupConfirmed.title") }}</h1>
    <h2 class="subtitle-text">{{ $t("pages.signupConfirmed.subtitle") }}</h2>
    <div>{{ $t("pages.signupConfirmed.text") }}</div>
  </div>
</template>
