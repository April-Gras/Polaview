<script lang="ts">
import { defineComponent } from "vue";
import { useRoute } from "vue-router";

import FoldCardGridVue from "@/components/ui/FoldCardGrid.vue";
import PeopleCardVue from "@/components/cards/PeopleCard.vue";
import CharacterCardVue from "@/components/cards/CharacterCard.vue";
import VVideoVue from "@/components/VVideo.vue";

import type {
  Episode,
  Movie,
  MovieOverviewTranslation,
  People,
} from "@prisma/client";
import type { FileSummary } from "~/types/RouteLibraryScraper";

export default defineComponent({
  components: {
    FoldCardGridVue,
    PeopleCardVue,
    CharacterCardVue,
    VVideoVue,
  },
  setup() {
    const { params, path } = useRoute();
    const entityType = path.includes("movie")
      ? ("movie" as const)
      : ("episode" as const);

    return {
      id: params.id,
      entityType,
    };
  },
  data() {
    return {
      file: null as null | FileSummary<Movie | Episode>,
    };
  },
  async created() {
    try {
      const { data: file } = await this.$getScraperRequest(
        `/file/${this.entityType}/${this.id}/`
      );
      this.file = file as FileSummary<Movie | Episode>;
    } catch (_) {
      this.$router.push("/error");
    }
  },
  computed: {
    entity(): FileSummary<Movie>["movie"] | FileSummary<Episode>["episode"] {
      if (!this.file) throw "No file found";
      // @ts-expect-error
      return this.file[this.entityType];
    },
    overview(): string | undefined {
      const userLanguage = this.$i18n.locale;
      const overviewCollection = this.entity
        .overviews as MovieOverviewTranslation[];

      return overviewCollection.find(({ lang }) => {
        return lang === userLanguage;
      })?.text;
    },
    directors(): People[] {
      if (this.typeSafeguardMovieEpisode(this.entity, "episode"))
        return this.entity.episodeOnDirector.map((e) => e.people) ?? [];
      if (this.typeSafeguardMovieEpisode(this.entity, "movie"))
        return this.entity.movieOnDirector.map((e) => e.people) ?? [];
      return [];
    },
    writers(): People[] {
      if (this.typeSafeguardMovieEpisode(this.entity, "episode"))
        return this.entity.episodeOnWriter.map((e) => e.people) ?? [];
      if (this.typeSafeguardMovieEpisode(this.entity, "movie"))
        return this.entity.movieOnWriter.map((e) => e.people) ?? [];
      return [];
    },
    cast(): People[] {
      if (this.typeSafeguardMovieEpisode(this.entity, "episode"))
        return this.entity.episodeOnCast.map((e) => e.people) ?? [];
      if (this.typeSafeguardMovieEpisode(this.entity, "movie"))
        return this.entity.movieOnCast.map((e) => e.people) ?? [];
      return [];
    },
  },
  methods: {
    typeSafeguardMovieEpisode<T extends "movie" | "episode">(
      entity: any,
      type: T
    ): entity is T extends "movie"
      ? FileSummary<Movie>["movie"]
      : FileSummary<Episode>["episode"] {
      return type === this.entityType;
    },
  },
});
</script>

<template>
  <div v-if="file && entity" class="relative grid w-full grid-cols-1 gap-10">
    <div class="flex items-end gap-2">
      <h1 class="title-text">
        {{ entity.name }}
      </h1>
      <h2 class="subtitle-text" v-if="entity.year">({{ entity.year }})</h2>
    </div>
    <VVideoVue :file-id="file.id" :subtitles="file.subtitleTracks" />
    <p v-if="overview" class="text-base">{{ overview }}</p>
    <FoldCardGridVue>
      <template #title>{{ $t("common.cast") }}</template>
      <template #list>
        <PeopleCardVue v-once :people="people" v-for="people in cast" />
      </template>
    </FoldCardGridVue>
    <FoldCardGridVue>
      <template #title>
        {{ $t("common.roles") }}
      </template>
      <template #list>
        <CharacterCardVue
          v-for="character in entity.characters"
          :character="character"
          :people-collection="cast"
          :key="character.id + character.name"
          v-once
        />
      </template>
    </FoldCardGridVue>
    <FoldCardGridVue>
      <template #title>{{
        $tc("common.directors", directors.length)
      }}</template>
      <template #list>
        <PeopleCardVue v-once :people="people" v-for="people in directors" />
      </template>
    </FoldCardGridVue>
    <FoldCardGridVue>
      <template #title>{{ $tc("common.writers", writers.length) }}</template>
      <template #list>
        <PeopleCardVue v-once :people="people" v-for="people in writers" />
      </template>
    </FoldCardGridVue>
  </div>
</template>
