<script lang="ts">
import { defineComponent } from "vue";

import { Title } from "@prisma/client";

import CardGridVue from "@/components/ui/CardGrid.vue";
import SerieCardVue from "@/components/cards/SerieCard.vue";
import TitleCardVue from "@/components/cards/TitleCard.vue";
import VSearchInputVue from "@/components/ui/VSearchInput.vue";

import type { SerieSummary } from "~/types/RouteLibraryScrapImdb";

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
    TitleCardVue,
    VSearchInputVue,
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
          <TitleCardVue
            v-for="title in latestMovies"
            :key="title.imdbId"
            :title="title"
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
            :key="serieSummary.imdbId"
            :serie-summary="serieSummary"
          />
        </template>
      </CardGridVue>
    </article>
  </section>
</template>
