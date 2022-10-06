<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({});
</script>

<template>
  <footer class="mt-auto bg-neutral-300 shadow dark:bg-slate-700">
    <div
      class="page-layout flex flex-wrap gap-4 sm:justify-between md:flex-nowrap"
    >
      <RouterLink to="/" class="flex items-start justify-start gap-2">
        <img src="/favicon_192.png" class="sugoma h-10 w-10 overflow-hidden" />
        <h3 class="title-text">Polaview</h3>
        <span>2022</span>
      </RouterLink>
      <div class="grid gap-2">
        <RouterLink to="/about">{{ $t("common.aboutPage") }}</RouterLink>
        <a href="mailto:admin@april-ti.me">{{ $t("common.contact") }}</a>
      </div>
    </div>
  </footer>
</template>

<style scoped lang="scss">
@keyframes sugoma {
  0% {
    transform: rotate(0) scale(1);
    filter: hue-rotate(0);
  }
  25% {
    transform: rotate(15deg) scale(1.05);
    filter: hue-rotate(90deg);
  }
  50% {
    transform: rotate(-15deg) scale(1.1);
    filter: hue-rotate(180deg);
  }
  75% {
    transform: rotate(5deg) scale(1.05);
    filter: hue-rotate(270deg);
  }
  100% {
    transform: rotate(0deg) scale(1);
    filter: hue-rotate(360deg);
  }
}

footer:hover {
  .sugoma {
    animation: sugoma 1s infinite ease-in-out alternate;
  }
}
</style>
