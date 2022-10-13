<script lang="ts">
import { defineComponent } from "vue";

import ManageAdditionRequestVue from "@/components/cards/additionRequestCards/ManageAdditionRequest.vue";

import type { EntityAddtionRequestSummary } from "~/types/RouteLibraryScraper";

export default defineComponent({
  components: {
    ManageAdditionRequestVue,
  },
  data() {
    return {
      ongoingRequests: [] as EntityAddtionRequestSummary[],
    };
  },
  created() {
    this.$getScraperRequest("/requests").then(({ data: requests }) => {
      this.ongoingRequests = requests;
    });
  },
  methods: {
    handleUpdateAdditionRequest(request: EntityAddtionRequestSummary) {
      const entityIndex = this.ongoingRequests.findIndex(
        (e) => e.id === request.id
      );

      if (entityIndex === -1) this.ongoingRequests.unshift(request);
      else this.ongoingRequests[entityIndex] = request;
    },
  },
});
</script>

<template>
  <ul class="grid gap-6">
    <ManageAdditionRequestVue
      v-for="request in ongoingRequests"
      :key="request.id"
      :request="request"
      @update-addition-request="handleUpdateAdditionRequest"
    />
  </ul>
</template>
