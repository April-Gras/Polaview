<script lang="ts">
import { Title, File, Person } from ".prisma/client";
import { defineComponent } from "vue";
import { useRoute } from "vue-router";

import CardGridVue from "@/components/ui/CardGrid.vue";
import PersonCardVue from "@/components/cards/PersonCard.vue";
import VVideoVue from "@/components/VVideo.vue";

export default defineComponent({
  components: {
    CardGridVue,
    PersonCardVue,
    VVideoVue,
  },
  setup() {
    const { params } = useRoute();

    return {
      imdbId: params.imdbId,
    };
  },
  data() {
    return {
      title: null as null | Title,
      file: null as null | File,
      cast: [] as Person[],
    };
  },
  created() {
    this.$getScrapImdbRequest(`/title/${this.imdbId as string}`)
      .then(({ data }) => (this.title = data))
      .then(() => {
        if (!this.title) return;
        this.$getScrapImdbRequest(
          `/file/titleImdbId/${this.title.imdbId}`
        ).then(({ data }) => {
          this.file = data;
        });
        this.$getScrapImdbRequest(`/title/${this.imdbId}/cast`).then(
          ({ data }) => {
            this.cast = data;
          }
        );
      });
  },
});
</script>

<template>
  <div v-if="file && title" class="relative grid w-full grid-cols-1 gap-10">
    <h1 class="title-text">
      <span>
        {{ title.name }}
      </span>
      <span v-if="title.releaseYear">({{ title.releaseYear }})</span>
    </h1>
    <VVideoVue :source="`/api/video/${file.id}`" />
    <CardGridVue class="relative hidden md:grid">
      <template #title>{{ $t("common.cast") }}</template>
      <template #list>
        <PersonCardVue
          class="hidden xl:grid"
          :person="person"
          v-for="person in cast.slice(0, 4)"
        />
        <PersonCardVue
          class="xl:hidden"
          :person="person"
          v-for="person in cast.slice(0, 3)"
        />
      </template>
    </CardGridVue>
  </div>
</template>
