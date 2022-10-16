<script lang="ts">
import {
  Movie,
  MovieOverviewTranslation,
  SerieOverviewTranslation,
  SerieV2,
} from "@prisma/client";
import { defineComponent } from "vue";

import VTextInputVue from "@/components/ui/VTextInput.vue";
import TitleOrSeriePreviewVue from "@/components/TitleOrSeriePreview.vue";

import { selectOverview } from "@/utils/selectOverview";

export default defineComponent({
  components: {
    VTextInputVue,
    TitleOrSeriePreviewVue,
  },
  data() {
    return {
      search: "",
      timer: null as null | number,
      movies: [] as (Movie & {
        overviews: MovieOverviewTranslation[];
      })[],
      series: [] as (SerieV2 & {
        overviews: SerieOverviewTranslation[];
      })[],
      displayResults: false,
    };
  },
  methods: {
    async execSearch(): Promise<void> {
      const searchTerm = this.search.trim();

      if (!searchTerm.length) return this.resetResults();
      const {
        data: { movies, series },
      } = await this.$getDataLayerRequest(`/cache/search/${this.search}`);

      this.movies = movies;
      this.series = series;
    },
    resetResults(): void {
      this.movies = [];
      this.series = [];
    },
    selectOverview,
  },
  watch: {
    search() {
      if (this.timer) window.clearTimeout(this.timer);
      this.timer = window.setTimeout(() => {
        this.timer = null;
        if (this.search.length) this.execSearch();
        else this.resetResults();
      }, 450);
    },
  },
});
</script>

<template>
  <section role="search" class="sectionWrap relative">
    <VTextInputVue
      v-model="search"
      label-for-uid="search"
      class="searchBar shadow-lg"
      :placeholder="$t('common.search')"
      labelIsScreenReaderOnly
      @focus="displayResults = true"
      @blur="displayResults = false"
    >
      <template #label>{{ $t("common.search") }}</template>
    </VTextInputVue>
    <Transition name="fade">
      <ul
        v-if="(movies.length || series.length) && displayResults"
        class="searchResults absolute z-50 grid max-h-80 w-full overflow-y-auto rounded bg-gray-300 py-6 shadow-lg dark:bg-gray-600"
      >
        <RouterLink
          v-for="movie in movies"
          :key="movie.id"
          :to="`/watch/movie/${movie.id}`"
        >
          <TitleOrSeriePreviewVue
            :image="movie.image"
            :name="movie.name"
            :overview="selectOverview(movie.overviews, $i18n.locale)"
          />
        </RouterLink>
        <RouterLink
          v-for="serie in series"
          :key="serie.id"
          :to="`/serie/${serie.id}`"
        >
          <TitleOrSeriePreviewVue
            :image="serie.image"
            :name="serie.name"
            :overview="selectOverview(serie.overviews, $i18n.locale)"
          />
        </RouterLink>
      </ul>
    </Transition>
  </section>
</template>

<style lang="scss" scoped>
.searchResults {
  top: calc(100% + theme("space.4"));
}
</style>
