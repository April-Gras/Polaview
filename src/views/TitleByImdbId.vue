<script lang="ts">
import { Title } from ".prisma/client";
import { defineComponent } from "vue";
import { useRoute } from "vue-router";

export default defineComponent({
  setup() {
    const { params } = useRoute();

    return {
      imdbId: params.imdbId,
    };
  },
  data() {
    return {
      title: null as null | Title,
    };
  },
  created() {
    this.$getScrapImdbRequest(`/title/${this.imdbId as string}`).then(
      ({ data }) => (this.title = data)
    );
  },
});
</script>

<template>
  <div>{{ imdbId }}</div>
</template>
