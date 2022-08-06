<script lang="ts">
import { defineComponent } from "vue";

import { Title } from "@prisma/client";

import TitleCardVue from "@/components/cards/TitleCard.vue";
import SerieCardVue from "@/components/cards/SerieCard.vue";

import type { SerieSummary } from "~/types/RouteLibraryScrapImdb";

export default defineComponent({
  components: {
    TitleCardVue,
    SerieCardVue,
  },
  data() {
    return {
      latestMovies: [] as Title[],
      latestSeries: [] as SerieSummary[],
    };
  },
  mounted() {
    this.fetchLatestMovies();
    this.fetchSerieSummarys();
  },
  methods: {
    async fetchLatestMovies() {
      const { data } = await this.$getScrapImdbRequest("/latest-movie/");

      this.latestMovies = data;
    },
    async fetchSerieSummarys() {
      const { data } = await this.$getScrapImdbRequest("/latest-serie/");

      this.latestSeries = data;
    },
  },
});
</script>

<template>
  <div class="mx-6 my-10 grid grid-cols-1 gap-4">
    <h1 class="title-text">{{ $t("pages.root.title") }}</h1>
    <article class="grid grid-cols-1 gap-6">
      <h2 class="subtitle-text">
        {{ $t("pages.root.categorySubtitles.latestMovies") }}
      </h2>
      <ul
        class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
      >
        <TitleCardVue
          v-for="title in latestMovies"
          :key="title.imdbId"
          :title="title"
        />
      </ul>
    </article>
    <article class="grid grid-cols-1 gap-6">
      <h2 class="subtitle-text">
        {{ $t("pages.root.categorySubtitles.latestSeries") }}
      </h2>
      <ul
        class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
      >
        <SerieCardVue
          v-for="serieSummary in latestSeries"
          :key="serieSummary.imdbId"
          :serie-summary="serieSummary"
        />
      </ul>
    </article>
  </div>
</template>
