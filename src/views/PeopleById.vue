<script lang="ts">
import { defineComponent } from "vue";
import { useRoute } from "vue-router";

import { selectOverview } from "@/utils/selectOverview";
import { formatDateLong } from "@/utils/dates";

// TODO display stuff about movies
// import CardGridVue from "@/components/ui/CardGrid.vue";
// import SerieCardVue from "@/components/cards/SerieCard.vue";
// import MovieCardVue from "@/components/cards/MovieCard.vue";
import VPillVue from "@/components/ui/VPill.vue";

import type { PeopleExtended } from "~/types/RouteLibraryDataLayer";

export default defineComponent({
  components: {
    VPillVue,
  },
  setup() {
    const {
      params: { id },
    } = useRoute();

    return {
      id: id as string,
    };
  },
  data() {
    return {
      people: null as null | PeopleExtended,
    };
  },
  created() {
    this.$getDataLayerRequest(`/people/${this.id}/`)
      .then(({ data: people }) => {
        this.people = people;
      })
      .catch(() => {
        this.$router.replace("/error");
      });
  },
  computed: {
    isDirector(): boolean {
      if (!this.people) return false;
      return (
        this.people.episodeOnDirector.length > 0 ||
        this.people.movieOnDirector.length > 0
      );
    },
    isWriter(): boolean {
      if (!this.people) return false;
      return (
        this.people.episodeOnWriter.length > 0 ||
        this.people.movieOnWriter.length > 0
      );
    },
    isCast(): boolean {
      if (!this.people) return false;
      return (
        this.people.episodeOnCast.length > 0 ||
        this.people.movieOnCast.length > 0
      );
    },
    biography(): null | string {
      if (!this.people) return null;
      return selectOverview(this.people.biography, this.$i18n.locale);
    },
  },
  methods: {
    formatDateLong,
    selectOverview,
  },
});
</script>

<template>
  <section v-if="people">
    <article class="grid grid-cols-1 gap-6 sm:flex">
      <div class="flex-shrink-0">
        <img v-if="people.image" :src="people.image" class="image" />
        <div v-else class="image bg-gradient-to-br from-gray-200 to-gray-600" />
      </div>
      <div class="grid grid-cols-1 gap-6">
        <div class="grid auto-rows-min grid-cols-1 gap-2">
          <h1 class="title-text text-center md:text-left">{{ people.name }}</h1>
          <div
            v-if="isCast || isDirector || isWriter"
            class="flex items-center justify-center gap-4 md:justify-start"
          >
            <VPillVue v-if="isCast">{{ $t("common.cast") }}</VPillVue>
            <VPillVue v-if="isDirector">{{ $t("common.directors") }}</VPillVue>
            <VPillVue v-if="isWriter">{{ $t("common.writers") }}</VPillVue>
          </div>
          <div
            v-if="people.birth || people.death"
            class="flex flex-wrap items-center justify-center gap-1 text-base md:justify-start"
          >
            <span class="text-gray-600 dark:text-gray-400" v-if="people.birth">{{
              $t("common.born", {
                date: formatDateLong(people.birth, $i18n.locale),
              })
            }}</span>
            <span
              class="text-gray-600 dark:text-gray-400"
              v-if="people.birthPlace"
              >{{ people.birthPlace }}</span
            >
            <span class="text-gray-600 dark:text-gray-400" v-if="people.death">{{
              $t("common.died", {
                date: formatDateLong(people.death, $i18n.locale),
              })
            }}</span>
          </div>
        </div>
        <p
          class="boder-solid overflow-hidden rounded border border-gray-400 bg-gray-300 p-4 text-center shadow dark:border-slate-700 dark:bg-slate-900"
          v-if="biography"
        >
          {{ biography }}
        </p>
      </div>
    </article>
    <article></article>
  </section>
</template>

<style lang="scss" scoped>
.image {
  @apply mx-auto h-64 w-48 overflow-hidden rounded-lg border-4 border-solid border-gray-200 object-cover object-center shadow dark:border-gray-700;

  @screen md {
    @apply mx-0;
  }
}
</style>
