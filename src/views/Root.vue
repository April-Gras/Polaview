<script lang="ts">
import { defineComponent } from "vue";

import { Title } from "@prisma/client";

import TitleCardVue from "@/components/TitleCard.vue";

export default defineComponent({
  components: {
    TitleCardVue,
  },
  data() {
    return {
      latestMovie: [] as Title[],
    };
  },
  mounted() {
    this.fetchTitles();
  },
  methods: {
    async fetchTitles() {
      const { data } = await this.$getScrapImdbRequest("/latest-movie/");

      this.latestMovie = data;
    },
  },
});
</script>

<template>
  <div class="mx-6 my-10 grid grid-cols-1 gap-4">
    <h1 class="title-text">{{ $t("pages.root.title") }}</h1>
    <article class="grid grid-cols-1 gap-6">
      <h2 class="subtitle-text">
        {{ $t("pages.root.categorySubtitles.latest") }}
      </h2>
      <ul
        class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
      >
        <TitleCardVue
          v-for="title in latestMovie"
          :key="title.imdbId"
          :title="title"
        />
      </ul>
    </article>
  </div>
</template>
