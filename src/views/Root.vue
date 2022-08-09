<script lang="ts">
import { defineComponent } from "vue";

import { Title } from "@prisma/client";

import CardGridVue from "@/components/ui/CardGrid.vue";
import SerieCardVue from "@/components/cards/SerieCard.vue";
import TitleCardVue from "@/components/cards/TitleCard.vue";

import type { SerieSummary } from "~/types/RouteLibraryScrapImdb";

export default defineComponent({
  components: {
    CardGridVue,
    SerieCardVue,
    TitleCardVue,
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
    <CardGridVue>
      <template #title>
        {{ $t("pages.root.categorySubtitles.latestMovies") }}
      </template>
      <template #list>
        <TitleCardVue
          v-for="title in latestMovies"
          :key="title.imdbId"
          :title="title"
        />
      </template>
    </CardGridVue>
    <CardGridVue>
      <template #title>
        {{ $t("pages.root.categorySubtitles.latestSeries") }}
      </template>
      <template #list>
        <SerieCardVue
          v-for="serieSummary in latestSeries"
          :key="serieSummary.imdbId"
          :serie-summary="serieSummary"
        />
      </template>
    </CardGridVue>
  </div>
</template>
