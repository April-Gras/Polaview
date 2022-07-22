<script lang="ts">
import { defineComponent } from "vue";

import { ImdbSearch } from "@prisma/client";

export default defineComponent({
  data() {
    return {
      results: [] as Omit<ImdbSearch, "imdbSearchCacheTerm">[],
      term: "",
    };
  },
  methods: {
    runSearch() {
      this.$postScrapImdbRequest("/search", { term: this.term }).then(
        ({ data }) => {
          this.results = data;
        }
      );
    },
  },
});
</script>

<template>
  <div class="w-full bg-blue-500">
    <input v-model="term" />
    <button @click="runSearch">Search</button>
    <div class="grid gap-4">
      <div v-for="entry in results" class="flex items-center">
        <img
          :src="entry.thumbnailUrl || ''"
          class="h-8 w-8 overflow-hidden rounded object-cover object-center shadow"
        />
        <span>{{ entry.title }}</span>
      </div>
    </div>
  </div>
</template>
