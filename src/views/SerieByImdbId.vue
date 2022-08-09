<script lang="ts">
import { defineComponent } from "vue";
import { useRoute } from "vue-router";

import { SeasonSummary } from "~/types/RouteLibraryScrapImdb";
import { Serie } from ".prisma/client";

export default defineComponent({
  setup() {
    const route = useRoute();

    return {
      imdbId: route.params.imdbId,
    };
  },
  data() {
    return {
      summary: null as { serie: Serie; seasons: SeasonSummary[] } | null,
    };
  },
  created() {
    this.$getScrapImdbRequest(`/serie/${this.imdbId}/seasons`).then(
      ({ data }) => {
        this.summary = data;
      }
    );
  },
});
</script>

<template>
  <div v-if="summary" class="grid gap-10">
    <div class="serieInfoHolder grid gap-4">
      <img
        class="picture"
        :src="summary.serie.pictureUrl"
        v-if="summary.serie.pictureUrl"
      />
      <div class="picture" v-else />
      <div class="grid grid-cols-1 gap-4">
        <h1 class="title-text">{{ summary.serie.name }}</h1>
        <div class="base-text">{{ summary.serie.storyline }}</div>
      </div>
    </div>
    <div class="grid grid-cols-1 gap-10">
      <div v-for="(season, index) in summary.seasons">
        <h2 class="subtitle-text">{{ $t("common.seasonCount", index + 1) }}</h2>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <RouterLink
            :to="`/title/${episode.imdbId}`"
            v-for="episode in season.episodes"
            class="episode relative max-h-[115px] cursor-pointer overflow-hidden rounded-sm shadow transition duration-150 ease-in-out hover:z-10 hover:scale-[1.02] hover:shadow-lg"
          >
            <img
              :src="episode.pictureUrl"
              v-if="episode.pictureUrl"
              class="w-full object-cover object-center"
            />
            <div v-else />
            <div
              class="episodeText absolute top-0 left-0 flex h-full w-full items-center justify-center bg-black bg-opacity-25 p-4 transition duration-150 ease-in-out hover:bg-opacity-5 dark:bg-opacity-75 hover:dark:bg-opacity-50"
            >
              <span class="ellipsis text-base !font-bold !text-white underline">
                {{ episode.name }}
              </span>
            </div>
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.serieInfoHolder {
  @apply grid-cols-1;

  @screen xs {
    grid-template-columns: 280px 1fr;
  }
}

.picture {
  @apply w-full overflow-hidden rounded border border-solid border-slate-700 p-2 dark:border-neutral-100;
}
</style>
