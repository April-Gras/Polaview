<script lang="ts">
import { defineComponent } from "vue";

import { Movie } from "@prisma/client";

import CardGridVue from "@/components/ui/CardGrid.vue";
import SerieCardVue from "@/components/cards/entityCards/SerieCard.vue";
import MovieCardVue from "@/components/cards/entityCards/MovieCard.vue";
import VSearchInputVue from "@/components/ui/VSearchInput.vue";

import type { SerieSummary } from "~/types/RouteLibraryScraper";

import { useUserStore } from "@/stores/user";

export default defineComponent({
  setup() {
    const USER_STORE = useUserStore();
    return {
      USER_NAME: USER_STORE.name,
    };
  },
  components: {
    CardGridVue,
    SerieCardVue,
    MovieCardVue,
    VSearchInputVue,
  },
  data() {
    return {
      latestMovies: [] as Movie[],
      latestSeries: [] as SerieSummary[],
    };
  },
  mounted() {
    this.fetchLatestMovies();
    this.fetchSerieSummarys();
  },
  methods: {
    async fetchLatestMovies() {
      const { data } = await this.$getScraperRequest("/latest-movie/");

      this.latestMovies = data;
    },
    async fetchSerieSummarys() {
      const { data } = await this.$getScraperRequest("/latest-serie/");

      this.latestSeries = data;
    },
  },
});
</script>

<template>
  <section class="my-10">
    <h1 class="title-text mb-10">
      {{ $t("pages.root.title", { name: USER_NAME }) }}
    </h1>
    <article class="grid grid-cols-1 gap-10">
      <VSearchInputVue />
      <CardGridVue v-if="latestMovies.length">
        <template #title>
          {{ $t("pages.root.categorySubtitles.latestMovies") }}
        </template>
        <template #list>
          <MovieCardVue
            v-for="movie in latestMovies"
            :key="movie.id"
            :movie="movie"
          />
        </template>
      </CardGridVue>
      <CardGridVue v-if="latestSeries.length">
        <template #title>
          {{ $t("pages.root.categorySubtitles.latestSeries") }}
        </template>
        <template #list>
          <SerieCardVue
            v-for="serieSummary in latestSeries"
            :key="serieSummary.id"
            :serie-summary="serieSummary"
          />
        </template>
      </CardGridVue>
    </article>
  </section>
</template>
