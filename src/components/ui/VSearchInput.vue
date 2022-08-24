<script lang="ts">
import { Title, Serie } from "@prisma/client";
import { defineComponent } from "vue";

import VTextInputVue from "@/components/ui/VTextInput.vue";
import TitleOrSeriePreviewVue from "@/components/TitleOrSeriePreview.vue";

export default defineComponent({
  components: {
    VTextInputVue,
    TitleOrSeriePreviewVue,
  },
  data() {
    return {
      search: "",
      timer: null as null | number,
      titles: [] as Title[],
      series: [] as Serie[],
      displayResults: false,
    };
  },
  methods: {
    async execSearch(): Promise<void> {
      const searchTerm = this.search.trim();

      if (!searchTerm.length) return this.resetResults();
      const { data } = await this.$getScrapImdbRequest(
        `/title/search/${this.search}`
      );

      this.titles = data.titles;
      this.series = data.series;
    },
    resetResults(): void {
      this.titles = [];
      this.series = [];
    },
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
      @focus="displayResults = true"
      @blur="displayResults = false"
    />
    <Transition name="fade">
      <ul
        v-if="(titles.length || series.length) && displayResults"
        class="searchResults absolute z-50 grid max-h-80 w-full overflow-y-auto rounded bg-slate-300 py-6 shadow-lg dark:bg-slate-600"
      >
        <RouterLink
          v-for="title in titles"
          :key="title.imdbId"
          :to="`/title/${title.imdbId}`"
        >
          <TitleOrSeriePreviewVue v-bind="title" />
        </RouterLink>
        <RouterLink
          v-for="serie in series"
          :key="serie.imdbId"
          :to="`/serie/${serie.imdbId}`"
        >
          <TitleOrSeriePreviewVue v-bind="serie" />
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
