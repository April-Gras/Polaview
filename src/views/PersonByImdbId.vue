<script lang="ts">
import { Person } from "@prisma/client";
import { defineComponent } from "vue";

export default defineComponent({
  data() {
    return {
      person: null as null | Person,
    };
  },
  created() {
    this.$getScraperRequest(`/person/${this.$route.params.imdbId}`).then(
      ({ data }) => {
        this.person = data;
      }
    );
  },
});
</script>

<template>
  <div>
    <p>Comming soon gamers, I promise</p>
    <p>
      For now here's the
      <a
        class="inline-block bg-blue-500 p-1 hover:bg-yellow-500"
        target="_blank"
        :href="`https://www.imdb.com/name/${$route.params.imdbId}`"
        >imdb link</a
      >
      to this person
    </p>
  </div>
</template>
