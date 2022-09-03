<script lang="ts">
import { Title, File, Person, Role } from ".prisma/client";
import { defineComponent } from "vue";
import { useRoute } from "vue-router";

import FoldCardGridVue from "@/components/ui/FoldCardGrid.vue";
import PersonCardVue from "@/components/cards/PersonCard.vue";
import RoleCardVue from "@/components/cards/RoleCard.vue";
import VVideoVue from "@/components/VVideo.vue";

export default defineComponent({
  components: {
    FoldCardGridVue,
    RoleCardVue,
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
      writers: [] as Person[],
      directors: [] as Person[],
      roles: [] as Role[],
    };
  },
  created() {
    this.$getScraperRequest(`/title/${this.imdbId as string}`)
      .then(({ data }) => (this.title = data))
      .then(() => {
        if (!this.title) return;
        this.$getScraperRequest(`/file/titleImdbId/${this.title.imdbId}`).then(
          ({ data }) => {
            this.file = data;
          }
        );
        this.$getScraperRequest(`/title/${this.imdbId}/cast`).then(
          ({ data }) => {
            this.cast = data;
          }
        );
        this.$getScraperRequest(`/title/${this.imdbId}/writers`).then(
          ({ data }) => {
            this.writers = data;
          }
        );
        this.$getScraperRequest(`/title/${this.imdbId}/directors`).then(
          ({ data }) => {
            this.directors = data;
          }
        );
        this.$getScraperRequest(`/title/${this.imdbId}/roles`).then(
          ({ data }) => {
            this.roles = data;
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
    <FoldCardGridVue>
      <template #title>{{ $t("common.cast") }}</template>
      <template #list>
        <PersonCardVue v-once :person="person" v-for="person in cast" />
      </template>
    </FoldCardGridVue>
    <FoldCardGridVue>
      <template #title>
        {{ $t("common.roles") }}
      </template>
      <template #list>
        <RoleCardVue
          v-for="role in roles"
          :role="role"
          :person-collection="cast"
          :key="role.imdbId + role.titleImdbId"
          v-once
        />
      </template>
    </FoldCardGridVue>
    <FoldCardGridVue>
      <template #title>{{
        $tc("common.directors", directors.length)
      }}</template>
      <template #list>
        <PersonCardVue v-once :person="person" v-for="person in directors" />
      </template>
    </FoldCardGridVue>
    <FoldCardGridVue>
      <template #title>{{ $tc("common.writers", writers.length) }}</template>
      <template #list>
        <PersonCardVue v-once :person="person" v-for="person in writers" />
      </template>
    </FoldCardGridVue>
  </div>
</template>
